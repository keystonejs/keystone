const { gen, sampleOne } = require('testcheck');
const { Text, Relationship } = require('@keystone/fields');
const cuid = require('cuid');
const { multiAdapterRunners, setupServer, graphqlRequest } = require('@keystone/test-utils');

const alphanumGenerator = gen.alphaNumString.notEmpty();

const toStr = items => items.map(item => item.toString());

// `mongodb-memory-server` downloads a binary on first run in CI, which can take
// a while, so we bump up the timeout here.
jest.setTimeout(60000);

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    name: `ks5-testdb-${cuid()}`,
    createLists: keystone => {
      keystone.createList('Student', {
        fields: {
          name: { type: Text },
          teachers: { type: Relationship, ref: 'Teacher.students', many: true },
        },
      });

      keystone.createList('Teacher', {
        fields: {
          name: { type: Text },
          students: { type: Relationship, ref: 'Student.teachers', many: true },
        },
      });
    },
  });
}

const getTeacher = async (keystone, teacherId) =>
  (await graphqlRequest({
    keystone,
    query: `query getTeacher($teacherId: ID!){
  Teacher(where: { id: $teacherId }) {
    id
    students { id }
  }
}`,
    variables: { teacherId },
  })).data.Teacher;

const getStudent = async (keystone, studentId) =>
  (await graphqlRequest({
    keystone,
    query: `query getStudent($studentId: ID!){
  Student(where: { id: $studentId }) {
    id
    teachers { id }
  }
}`,
    variables: { studentId },
  })).data.Student;

// We can't assume what IDs get assigned, or what order they come back in
const compareIds = (list, ids) =>
  expect(toStr(list.map(({ id }) => id).sort())).toMatchObject(
    ids.map(({ id }) => id.toString()).sort()
  );

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('update many to many relationship back reference', () => {
      describe('nested connect', () => {
        test(
          'during create mutation',
          runner(setupKeystone, async ({ keystone, create }) => {
            // Manually setup a connected Student <-> Teacher
            let teacher1 = await create('Teacher', {});
            await new Promise(resolve => process.nextTick(resolve));
            let teacher2 = await create('Teacher', {});

            // canaryStudent is used as a canary to make sure nothing crosses over
            let canaryStudent = await create('Student', {});

            teacher1 = await getTeacher(keystone, teacher1.id);
            teacher2 = await getTeacher(keystone, teacher2.id);
            canaryStudent = await getStudent(keystone, canaryStudent.id);

            // Sanity check the links are setup correctly
            expect(toStr(canaryStudent.teachers)).toHaveLength(0);
            expect(toStr(teacher1.students)).toHaveLength(0);
            expect(toStr(teacher2.students)).toHaveLength(0);

            // Run the query to disconnect the teacher from student
            const { data, errors } = await graphqlRequest({
              keystone,
              query: `
          mutation {
            createStudent(
              data: {
                teachers: { connect: [{ id: "${teacher1.id}" }, { id: "${teacher2.id}" }] }
              }
            ) {
              id
              teachers {
                id
              }
            }
          }
        `,
            });

            expect(errors).toBe(undefined);

            let newStudent = data.createStudent;

            // Check the link has been broken
            teacher1 = await getTeacher(keystone, teacher1.id);
            teacher2 = await getTeacher(keystone, teacher2.id);
            newStudent = await getStudent(keystone, newStudent.id);
            canaryStudent = await getStudent(keystone, canaryStudent.id);

            compareIds(canaryStudent.teachers, []);
            compareIds(newStudent.teachers, [teacher1, teacher2]);
            compareIds(teacher1.students, [newStudent]);
            compareIds(teacher2.students, [newStudent]);
          })
        );

        test(
          'during update mutation',
          runner(setupKeystone, async ({ keystone, create }) => {
            // Manually setup a connected Student <-> Teacher
            let teacher1 = await create('Teacher', {});
            let teacher2 = await create('Teacher', {});
            let student1 = await create('Student', {});
            // Student2 is used as a canary to make sure things don't accidentally
            // cross over
            let student2 = await create('Student', {});

            teacher1 = await getTeacher(keystone, teacher1.id);
            teacher2 = await getTeacher(keystone, teacher2.id);
            student1 = await getStudent(keystone, student1.id);
            student2 = await getStudent(keystone, student2.id);

            // Sanity check the links are setup correctly
            expect(toStr(student1.teachers)).toHaveLength(0);
            expect(toStr(student2.teachers)).toHaveLength(0);
            expect(toStr(teacher1.students)).toHaveLength(0);
            expect(toStr(teacher2.students)).toHaveLength(0);

            // Run the query to disconnect the teacher from student
            const { errors } = await graphqlRequest({
              keystone,
              query: `
          mutation {
            updateStudent(
              id: "${student1.id}",
              data: {
                teachers: { connect: [{ id: "${teacher1.id}" }, { id: "${teacher2.id}" }] }
              }
            ) {
              id
              teachers {
                id
              }
            }
          }
      `,
            });

            expect(errors).toBe(undefined);

            // Check the link has been broken
            teacher1 = await getTeacher(keystone, teacher1.id);
            teacher2 = await getTeacher(keystone, teacher2.id);
            student1 = await getStudent(keystone, student1.id);
            student2 = await getStudent(keystone, student2.id);

            // Sanity check the links are setup correctly
            compareIds(student1.teachers, [teacher1, teacher2]);
            compareIds(student2.teachers, []);
            compareIds(teacher1.students, [student1]);
            compareIds(teacher2.students, [student1]);
          })
        );
      });

      describe('nested create', () => {
        test(
          'during create mutation',
          runner(setupKeystone, async ({ keystone }) => {
            const teacherName1 = sampleOne(alphanumGenerator);
            const teacherName2 = sampleOne(alphanumGenerator);

            // Run the query to disconnect the teacher from student
            const { data, errors } = await graphqlRequest({
              keystone,
              query: `
          mutation {
            createStudent(
              data: {
                teachers: { create: [{ name: "${teacherName1}" }, { name: "${teacherName2}" }] }
              }
            ) {
              id
              teachers(orderBy: "id_ASC") {
                id
              }
            }
          }
      `,
            });

            expect(errors).toBe(undefined);

            let newStudent = data.createStudent;
            let newTeachers = data.createStudent.teachers;

            // Check the link has been broken
            const teacher1 = await getTeacher(keystone, newTeachers[0].id);
            const teacher2 = await getTeacher(keystone, newTeachers[1].id);
            newStudent = await getStudent(keystone, newStudent.id);

            compareIds(newStudent.teachers, [teacher1, teacher2]);
            compareIds(teacher1.students, [newStudent]);
            compareIds(teacher2.students, [newStudent]);
          })
        );

        test(
          'during update mutation',
          runner(setupKeystone, async ({ keystone, create }) => {
            let student = await create('Student', {});
            const teacherName1 = sampleOne(alphanumGenerator);
            const teacherName2 = sampleOne(alphanumGenerator);

            // Run the query to disconnect the teacher from student
            const { data, errors } = await graphqlRequest({
              keystone,
              query: `
          mutation {
            updateStudent(
              id: "${student.id}"
              data: {
                teachers: { create: [{ name: "${teacherName1}" }, { name: "${teacherName2}" }] }
              }
            ) {
              id
              teachers {
                id
              }
            }
          }
      `,
            });

            expect(errors).toBe(undefined);

            let newTeachers = data.updateStudent.teachers;

            // Check the link has been broken
            const teacher1 = await getTeacher(keystone, newTeachers[0].id);
            const teacher2 = await getTeacher(keystone, newTeachers[1].id);
            student = await getStudent(keystone, student.id);

            compareIds(student.teachers, [teacher1, teacher2]);
            compareIds(teacher1.students, [student]);
            compareIds(teacher2.students, [student]);
          })
        );
      });

      test(
        'nested disconnect during update mutation',
        runner(setupKeystone, async ({ keystone, create, update }) => {
          // Manually setup a connected Student <-> Teacher
          let teacher1 = await create('Teacher', {});
          let teacher2 = await create('Teacher', {});
          let student1 = await create('Student', { teachers: [teacher1.id, teacher2.id] });
          let student2 = await create('Student', { teachers: [teacher1.id, teacher2.id] });

          await update('Teacher', teacher1.id, { students: [student1.id, student2.id] });
          await update('Teacher', teacher2.id, { students: [student1.id, student2.id] });

          teacher1 = await getTeacher(keystone, teacher1.id);
          teacher2 = await getTeacher(keystone, teacher2.id);
          student1 = await getStudent(keystone, student1.id);
          student2 = await getStudent(keystone, student2.id);

          // Sanity check the links are setup correctly
          compareIds(student1.teachers, [teacher1, teacher2]);
          compareIds(student2.teachers, [teacher1, teacher2]);
          compareIds(teacher1.students, [student1, student2]);
          compareIds(teacher2.students, [student1, student2]);

          // Run the query to disconnect the teacher from student
          const { errors } = await graphqlRequest({
            keystone,
            query: `
        mutation {
          updateStudent(
            id: "${student1.id}",
            data: {
              teachers: { disconnect: [{ id: "${teacher1.id}" }] }
            }
          ) {
            id
            teachers {
              id
            }
          }
        }
    `,
          });

          expect(errors).toBe(undefined);

          // Check the link has been broken
          teacher1 = await getTeacher(keystone, teacher1.id);
          teacher2 = await getTeacher(keystone, teacher2.id);
          student1 = await getStudent(keystone, student1.id);
          student2 = await getStudent(keystone, student2.id);

          // Sanity check the links are setup correctly
          compareIds(student1.teachers, [teacher2]);
          compareIds(student2.teachers, [teacher1, teacher2]);
          compareIds(teacher1.students, [student2]);
          compareIds(teacher2.students, [student1, student2]);
        })
      );

      test(
        'nested disconnectAll during update mutation',
        runner(setupKeystone, async ({ keystone, create, update }) => {
          // Manually setup a connected Student <-> Teacher
          let teacher1 = await create('Teacher', {});
          let teacher2 = await create('Teacher', {});
          let student1 = await create('Student', { teachers: [teacher1.id, teacher2.id] });
          let student2 = await create('Student', { teachers: [teacher1.id, teacher2.id] });

          await update('Teacher', teacher1.id, { students: [student1.id, student2.id] });
          await update('Teacher', teacher2.id, { students: [student1.id, student2.id] });

          teacher1 = await getTeacher(keystone, teacher1.id);
          teacher2 = await getTeacher(keystone, teacher2.id);
          student1 = await getStudent(keystone, student1.id);
          student2 = await getStudent(keystone, student2.id);

          // Sanity check the links are setup correctly
          compareIds(student1.teachers, [teacher1, teacher2]);
          compareIds(student2.teachers, [teacher1, teacher2]);
          compareIds(teacher1.students, [student1, student2]);
          compareIds(teacher2.students, [student1, student2]);

          // Run the query to disconnect the teacher from student
          const { errors } = await graphqlRequest({
            keystone,
            query: `
        mutation {
          updateStudent(
            id: "${student1.id}",
            data: {
              teachers: { disconnectAll: true }
            }
          ) {
            id
            teachers {
              id
            }
          }
        }
    `,
          });

          expect(errors).toBe(undefined);

          // Check the link has been broken
          teacher1 = await getTeacher(keystone, teacher1.id);
          teacher2 = await getTeacher(keystone, teacher2.id);
          student1 = await getStudent(keystone, student1.id);
          student2 = await getStudent(keystone, student2.id);

          // Sanity check the links are setup correctly
          compareIds(student1.teachers, []);
          compareIds(student2.teachers, [teacher1, teacher2]);
          compareIds(teacher1.students, [student2]);
          compareIds(teacher2.students, [student2]);
        })
      );
    });

    test(
      'delete mutation updates back references in to-many relationship',
      runner(setupKeystone, async ({ keystone, create, update }) => {
        // Manually setup a connected Student <-> Teacher
        let teacher1 = await create('Teacher', {});
        let teacher2 = await create('Teacher', {});
        let student1 = await create('Student', { teachers: [teacher1.id, teacher2.id] });
        let student2 = await create('Student', { teachers: [teacher1.id, teacher2.id] });

        await update('Teacher', teacher1.id, { students: [student1.id, student2.id] });
        await update('Teacher', teacher2.id, { students: [student1.id, student2.id] });

        teacher1 = await getTeacher(keystone, teacher1.id);
        teacher2 = await getTeacher(keystone, teacher2.id);
        student1 = await getStudent(keystone, student1.id);
        student2 = await getStudent(keystone, student2.id);

        // Sanity check the links are setup correctly
        compareIds(student1.teachers, [teacher1, teacher2]);
        compareIds(student2.teachers, [teacher1, teacher2]);
        compareIds(teacher1.students, [student1, student2]);
        compareIds(teacher2.students, [student1, student2]);

        // Run the query to delete the student
        const { errors } = await graphqlRequest({
          keystone,
          query: `
      mutation {
        deleteStudent(id: "${student1.id}") {
          id
        }
      }
  `,
        });
        expect(errors).toBe(undefined);

        teacher1 = await getTeacher(keystone, teacher1.id);
        teacher2 = await getTeacher(keystone, teacher2.id);
        student1 = await getStudent(keystone, student1.id);
        student2 = await getStudent(keystone, student2.id);

        // Check the link has been broken
        expect(student1).toBe(null);
        compareIds(student2.teachers, [teacher1, teacher2]);
        compareIds(teacher1.students, [student2]);
        compareIds(teacher2.students, [student2]);
      })
    );
  })
);

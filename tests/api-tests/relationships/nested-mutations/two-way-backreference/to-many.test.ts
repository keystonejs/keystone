import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-6/core/fields';
import { list } from '@keystone-6/core';
import { KeystoneContext } from '@keystone-6/core/types';
import { setupTestRunner } from '@keystone-6/core/testing';
import { apiTestConfig } from '../../../utils';

const alphanumGenerator = gen.alphaNumString.notEmpty();

type IdType = any;

const toStr = (items: any[]) => items.map(item => item.toString());

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
      Student: list({
        fields: {
          name: text(),
          teachers: relationship({ ref: 'Teacher.students', many: true }),
        },
      }),
      Teacher: list({
        fields: {
          name: text(),
          students: relationship({ ref: 'Student.teachers', many: true }),
        },
      }),
    },
  }),
});

const getTeacher = async (context: KeystoneContext, teacherId: IdType) =>
  context.query.Teacher.findOne({
    where: { id: teacherId },
    query: 'id students { id }',
  });

const getStudent = async (context: KeystoneContext, studentId: IdType) => {
  type T = { data: { student: { id: IdType; teachers: { id: IdType }[] } } };
  const { data } = (await context.graphql.raw({
    query: `
      query getStudent($studentId: ID!){
        student(where: { id: $studentId }) {
          id
          teachers { id }
        }
      }`,
    variables: { studentId },
  })) as T;
  return data.student;
};

// We can't assume what IDs get assigned, or what order they come back in
const compareIds = (list: { id: IdType }[], ids: IdType[]) =>
  expect(toStr(list.map(({ id }) => id).sort())).toMatchObject(
    ids.map(({ id }) => id.toString()).sort()
  );

describe('update many to many relationship back reference', () => {
  describe('nested connect', () => {
    test(
      'during create mutation',
      runner(async ({ context }) => {
        // Manually setup a connected Student <-> Teacher
        let teacher1 = await context.query.Teacher.createOne({ data: {} });
        await new Promise(resolve => process.nextTick(resolve));
        let teacher2 = await context.query.Teacher.createOne({ data: {} });

        // canaryStudent is used as a canary to make sure nothing crosses over
        let canaryStudent = await context.query.Student.createOne({ data: {} });

        teacher1 = await getTeacher(context, teacher1.id);
        teacher2 = await getTeacher(context, teacher2.id);
        canaryStudent = await getStudent(context, canaryStudent.id);

        // Sanity check the links are setup correctly
        expect(toStr(canaryStudent.teachers)).toHaveLength(0);
        expect(toStr(teacher1.students)).toHaveLength(0);
        expect(toStr(teacher2.students)).toHaveLength(0);

        // Run the query to disconnect the teacher from student
        let newStudent = await context.query.Student.createOne({
          data: { teachers: { connect: [{ id: teacher1.id }, { id: teacher2.id }] } },
          query: 'id teachers { id }',
        });

        // Check the link has been broken
        teacher1 = await getTeacher(context, teacher1.id);
        teacher2 = await getTeacher(context, teacher2.id);
        newStudent = await getStudent(context, newStudent.id);
        canaryStudent = await getStudent(context, canaryStudent.id);

        compareIds(canaryStudent.teachers, []);
        compareIds(newStudent.teachers, [teacher1, teacher2]);
        compareIds(teacher1.students, [newStudent]);
        compareIds(teacher2.students, [newStudent]);
      })
    );

    test(
      'during update mutation',
      runner(async ({ context }) => {
        // Manually setup a connected Student <-> Teacher
        let teacher1 = await context.query.Teacher.createOne({ data: {} });
        let teacher2 = await context.query.Teacher.createOne({ data: {} });
        let student1 = await context.query.Student.createOne({ data: {} });
        // Student2 is used as a canary to make sure things don't accidentally
        // cross over
        let student2 = await context.query.Student.createOne({ data: {} });

        teacher1 = await getTeacher(context, teacher1.id);
        teacher2 = await getTeacher(context, teacher2.id);
        student1 = await getStudent(context, student1.id);
        student2 = await getStudent(context, student2.id);

        // Sanity check the links are setup correctly
        expect(toStr(student1.teachers)).toHaveLength(0);
        expect(toStr(student2.teachers)).toHaveLength(0);
        expect(toStr(teacher1.students)).toHaveLength(0);
        expect(toStr(teacher2.students)).toHaveLength(0);

        // Run the query to disconnect the teacher from student
        await context.query.Student.updateOne({
          where: { id: student1.id },
          data: { teachers: { connect: [{ id: teacher1.id }, { id: teacher2.id }] } },
          query: 'id teachers { id }',
        });

        // Check the link has been broken
        teacher1 = await getTeacher(context, teacher1.id);
        teacher2 = await getTeacher(context, teacher2.id);
        student1 = await getStudent(context, student1.id);
        student2 = await getStudent(context, student2.id);

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
      runner(async ({ context }) => {
        const teacherName1 = sampleOne(alphanumGenerator);
        const teacherName2 = sampleOne(alphanumGenerator);

        // Run the query to disconnect the teacher from student
        let newStudent = await context.query.Student.createOne({
          data: { teachers: { create: [{ name: teacherName1 }, { name: teacherName2 }] } },
          query: 'id teachers(orderBy: { id: asc }) { id }',
        });

        let newTeachers = newStudent.teachers;

        // Check the link has been broken
        const teacher1 = await getTeacher(context, newTeachers[0].id);
        const teacher2 = await getTeacher(context, newTeachers[1].id);
        newStudent = await getStudent(context, newStudent.id);

        compareIds(newStudent.teachers, [teacher1, teacher2]);
        compareIds(teacher1.students, [newStudent]);
        compareIds(teacher2.students, [newStudent]);
      })
    );

    test(
      'during update mutation',
      runner(async ({ context }) => {
        let student = await context.query.Student.createOne({ data: {} });
        const teacherName1 = sampleOne(alphanumGenerator);
        const teacherName2 = sampleOne(alphanumGenerator);

        // Run the query to disconnect the teacher from student
        const _student = await context.query.Student.updateOne({
          where: { id: student.id },
          data: { teachers: { create: [{ name: teacherName1 }, { name: teacherName2 }] } },
          query: 'id teachers { id }',
        });

        let newTeachers = _student.teachers;

        // Check the link has been broken
        const teacher1 = await getTeacher(context, newTeachers[0].id);
        const teacher2 = await getTeacher(context, newTeachers[1].id);
        student = await getStudent(context, student.id);

        compareIds(student.teachers, [teacher1, teacher2]);
        compareIds(teacher1.students, [student]);
        compareIds(teacher2.students, [student]);
      })
    );
  });

  test(
    'nested disconnect during update mutation',
    runner(async ({ context }) => {
      // Manually setup a connected Student <-> Teacher
      let teacher1 = await context.query.Teacher.createOne({ data: {} });
      let teacher2 = await context.query.Teacher.createOne({ data: {} });
      let student1 = await context.query.Student.createOne({
        data: { teachers: { connect: [{ id: teacher1.id }, { id: teacher2.id }] } },
      });
      let student2 = await context.query.Student.createOne({
        data: { teachers: { connect: [{ id: teacher1.id }, { id: teacher2.id }] } },
      });

      await context.query.Teacher.updateMany({
        data: [
          {
            where: { id: teacher1.id },
            data: { students: { connect: [{ id: student1.id }, { id: student2.id }] } },
          },
          {
            where: { id: teacher2.id },
            data: { students: { connect: [{ id: student1.id }, { id: student2.id }] } },
          },
        ],
      });

      teacher1 = await getTeacher(context, teacher1.id);
      teacher2 = await getTeacher(context, teacher2.id);
      student1 = await getStudent(context, student1.id);
      student2 = await getStudent(context, student2.id);

      // Sanity check the links are setup correctly
      compareIds(student1.teachers, [teacher1, teacher2]);
      compareIds(student2.teachers, [teacher1, teacher2]);
      compareIds(teacher1.students, [student1, student2]);
      compareIds(teacher2.students, [student1, student2]);

      // Run the query to disconnect the teacher from student
      await context.query.Student.updateOne({
        where: { id: student1.id },
        data: { teachers: { disconnect: [{ id: teacher1.id }] } },
        query: 'id teachers { id }',
      });

      // Check the link has been broken
      teacher1 = await getTeacher(context, teacher1.id);
      teacher2 = await getTeacher(context, teacher2.id);
      student1 = await getStudent(context, student1.id);
      student2 = await getStudent(context, student2.id);

      // Sanity check the links are setup correctly
      compareIds(student1.teachers, [teacher2]);
      compareIds(student2.teachers, [teacher1, teacher2]);
      compareIds(teacher1.students, [student2]);
      compareIds(teacher2.students, [student1, student2]);
    })
  );

  test(
    'nested set: [] during update mutation',
    runner(async ({ context }) => {
      // Manually setup a connected Student <-> Teacher
      let teacher1 = await context.query.Teacher.createOne({ data: {} });
      let teacher2 = await context.query.Teacher.createOne({ data: {} });
      let student1 = await context.query.Student.createOne({
        data: { teachers: { connect: [{ id: teacher1.id }, { id: teacher2.id }] } },
      });
      let student2 = await context.query.Student.createOne({
        data: { teachers: { connect: [{ id: teacher1.id }, { id: teacher2.id }] } },
      });

      await context.query.Teacher.updateMany({
        data: [
          {
            where: { id: teacher1.id },
            data: { students: { connect: [{ id: student1.id }, { id: student2.id }] } },
          },
          {
            where: { id: teacher2.id },
            data: { students: { connect: [{ id: student1.id }, { id: student2.id }] } },
          },
        ],
      });

      teacher1 = await getTeacher(context, teacher1.id);
      teacher2 = await getTeacher(context, teacher2.id);
      student1 = await getStudent(context, student1.id);
      student2 = await getStudent(context, student2.id);

      // Sanity check the links are setup correctly
      compareIds(student1.teachers, [teacher1, teacher2]);
      compareIds(student2.teachers, [teacher1, teacher2]);
      compareIds(teacher1.students, [student1, student2]);
      compareIds(teacher2.students, [student1, student2]);

      // Run the query to disconnect the teacher from student
      await context.query.Student.updateOne({
        where: { id: student1.id },
        data: { teachers: { set: [] } },
        query: 'id teachers { id }',
      });

      // Check the link has been broken
      teacher1 = await getTeacher(context, teacher1.id);
      teacher2 = await getTeacher(context, teacher2.id);
      student1 = await getStudent(context, student1.id);
      student2 = await getStudent(context, student2.id);

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
  runner(async ({ context }) => {
    // Manually setup a connected Student <-> Teacher
    let teacher1 = await context.query.Teacher.createOne({ data: {} });
    let teacher2 = await context.query.Teacher.createOne({ data: {} });
    let student1 = await context.query.Student.createOne({
      data: { teachers: { connect: [{ id: teacher1.id }, { id: teacher2.id }] } },
    });
    let student2 = await context.query.Student.createOne({
      data: { teachers: { connect: [{ id: teacher1.id }, { id: teacher2.id }] } },
    });

    await context.query.Teacher.updateMany({
      data: [
        {
          where: { id: teacher1.id },
          data: { students: { connect: [{ id: student1.id }, { id: student2.id }] } },
        },
        {
          where: { id: teacher2.id },
          data: { students: { connect: [{ id: student1.id }, { id: student2.id }] } },
        },
      ],
    });

    teacher1 = await getTeacher(context, teacher1.id);
    teacher2 = await getTeacher(context, teacher2.id);
    student1 = await getStudent(context, student1.id);
    student2 = await getStudent(context, student2.id);

    // Sanity check the links are setup correctly
    compareIds(student1.teachers, [teacher1, teacher2]);
    compareIds(student2.teachers, [teacher1, teacher2]);
    compareIds(teacher1.students, [student1, student2]);
    compareIds(teacher2.students, [student1, student2]);

    // Run the query to delete the student
    await context.query.Student.deleteOne({ where: { id: student1.id } });
    teacher1 = await getTeacher(context, teacher1.id);
    teacher2 = await getTeacher(context, teacher2.id);
    student1 = await getStudent(context, student1.id);
    student2 = await getStudent(context, student2.id);

    // Check the link has been broken
    expect(student1).toBe(null);
    compareIds(student2.teachers, [teacher1, teacher2]);
    compareIds(teacher1.students, [student2]);
    compareIds(teacher2.students, [student2]);
  })
);

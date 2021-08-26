import { KeystoneContext } from '@keystone-next/keystone/types';
import { persons, tasks } from './data';

type PersonProps = {
  name: String;
};

type TaskProps = {
  label: String;
  isComplete: Boolean;
  finishBy: String;
  assignedTo: Object;
  person?: Object;
};

export async function insertSeedData(context: KeystoneContext) {
  console.log(`🌱 Inserting seed data`);

  const createPerson = async (personData: PersonProps) => {
    let person = null;
    try {
      person = await context.lists.Person.findOne({
        where: { name: personData.name },
        query: 'id',
      });
    } catch (e) {}
    if (!person) {
      person = await context.lists.Person.createOne({
        data: personData,
        query: 'id',
      });
    }
    return person;
  };

  const createTask = async (taskData: TaskProps) => {
    let persons;
    try {
      persons = await context.lists.Person.findMany({
        where: { name: { equals: taskData.person } },
        query: 'id',
      });
    } catch (e) {
      persons = [];
    }

    taskData.assignedTo = { connect: { id: persons[0].id } };
    const task = await context.lists.Task.createOne({
      data: taskData,
      query: 'id',
    });
    return task;
  };

  for (const person of persons) {
    console.log(`👩 Adding person: ${person.name}`);
    await createPerson(person);
  }
  for (const task of tasks) {
    console.log(`🔘 Adding task: ${task.label}`);
    await createTask(task);
  }

  console.log(`✅ Seed data inserted`);
  console.log(`👋 Please start the process with \`yarn dev\` or \`npm run dev\``);
  process.exit();
}

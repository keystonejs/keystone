import { KeystoneContext } from '@keystone-next/types';
import { persons, tasks } from './data';

export async function insertSeedData(context: KeystoneContext) {
  console.log(`🌱 Inserting seed data`);

  const createTask = async taskData => {
    let persons = [];
    try {
      persons = await context.lists.Person.findMany({
        where: { name: { equals: taskData.person } },
        query: 'id',
      });
    } catch (e) {}
    taskData.person = { connect: { id: persons[0].id } };
    const task = await context.lists.Task.createOne({
      data: taskData,
      query: 'id',
    });
    return task;
  };

  const createPerson = async personData => {
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

  for (const person of persons) {
    console.log(`👩 Adding person: ${person.name}`);
    await createPerson(person);
  }
  for (const task of tasks) {
    console.log(`🔘 Adding task: ${task.title}`);
    await createTask(task);
  }

  console.log(`✅ Seed data inserted`);
  console.log(`👋 Please start the process with \`yarn dev\` or \`npm run dev\``);
  process.exit();
}

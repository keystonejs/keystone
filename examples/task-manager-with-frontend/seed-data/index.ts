import { KeystoneContext } from '@keystone-6/core/types';
import { persons, tasks } from './data';

type PersonProps = {
  name: string;
};

type TaskProps = {
  label: string;
  isComplete: Boolean;
  finishBy: string;
  assignedTo: Object;
  person?: Object;
};

export async function insertSeedData(context: KeystoneContext) {
  console.log(`🌱 Inserting seed data`);

  const createPerson = async (personData: PersonProps) => {
    let person = await context.query.Person.findOne({
      where: { name: personData.name },
      query: 'id',
    });

    if (!person) {
      person = await context.query.Person.createOne({
        data: personData,
        query: 'id',
      });
    }
  };

  const createTask = async (taskData: TaskProps) => {
    let persons = await context.query.Person.findMany({
      where: { name: { equals: taskData.assignedTo } },
      query: 'id',
    });

    taskData.assignedTo = { connect: { id: persons[0].id } };

    await context.query.Task.createOne({
      data: taskData,
      query: 'id',
    });
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

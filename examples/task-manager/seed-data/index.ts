import { persons, tasks } from './data';
import { Context } from '.keystone/types';

type PersonProps = {
  name: string;
};

type TaskProps = {
  label: string;
  isComplete: boolean;
  finishBy: string;
  assignedTo: string;
};

export async function insertSeedData(context: Context) {
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

    await context.query.Task.createOne({
      data: { ...taskData, assignedTo: { connect: { id: persons[0].id } } },
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

import React from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';

const query = gql`
  query getTasks {
    incompleteTasks: tasks(orderBy: [{ finishBy: desc }]) {
      id
      priority
      isComplete
      finishBy
      label
    }
    completeTasks: tasks(orderBy: [{ finishBy: desc }]) {
      id
      priority
      isComplete
      finishBy
      label
    }
  }
`;

const mutation = gql`
  mutation updateATask($id: ID, $isComplete: Boolean, $finishedBy: DateTime) {
    updateTask(where: { id: $id }, data: { isComplete: $isComplete, finishBy: $finishedBy }) {
      isComplete
      id
      finishBy
    }
  }
`;

type Task = {
  id: string;
  priority: 'low' | 'medium' | 'high';
  isComplete: boolean;
  finishBy: string;
  label: string;
};

const TodoItem = ({ label, priority, isComplete, onCheckboxChange = () => {} }) => {
  return (
    <div style={cardStyle}>
      <input
        type="checkbox"
        checked={isComplete}
        onClick={() => {
          onCheckboxChange();
        }}
      />
      <div
        style={{
          height: 8,
          width: 8,
          borderRadius: 180,
          background: getPriorityColor(priority),
          display: 'inline-block',
          marginLeft: 8,
          marginRight: 8,
        }}
      />
      <span>{label}</span>
    </div>
  );
};

const getPriorityColor = (priority: string) =>
  priority === 'low' ? 'mediumspringgreen' : priority === 'medium' ? 'orange' : 'red';

const cardStyle = {
  margin: 'auto',
  width: 360,
  padding: 4,
  borderRadius: 3,
  marginTop: 4,
};

const Divider = () => (
  <div
    style={{
      width: 120,
      height: 1,
      marginLeft: 'auto',
      marginRight: 'auto',
      marginTop: 16,
      marginBottom: 16,
      background: 'black',
    }}
  />
);

export default function Index() {
  const { loading, error, data } =
    useQuery<{ incompleteTasks: Task[]; completeTasks: Task[] }>(query);
  const [updateDoneStatus] = useMutation<
    any,
    { id: string; finishedBy: string | null; isComplete: boolean }
  >(mutation);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !data) {
    return (
      <div>
        <div>We had an error contacting the Keystone server - make sure it's up and running.</div>
        <div>Error message: {error?.message}</div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>To-Do 💻</h2>
      {data.incompleteTasks.map(todoItem => (
        <TodoItem {...todoItem} />
      ))}
      <Divider />
      <h2 style={{ textAlign: 'center' }}>Done! 🏖</h2>
      {data.completeTasks.map(todoItem => (
        <TodoItem
          {...todoItem}
          onCheckboxChange={() =>
            updateDoneStatus({
              variables: {
                id: todoItem.id,
                finishedBy: null,
                isComplete: false,
              },
            })
          }
        />
      ))}
    </div>
  );
}

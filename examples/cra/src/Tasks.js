import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";

export const ALL_TASKS = gql`
  {
    allTasks {
      label
    }
  }
`;

function Tasks() {
  const { loading, error, data } = useQuery(ALL_TASKS);
  if (loading) {
    return <div>Loading tasks...</div>;
  }
  if (error) {
    console.error(error);
    return null;
  }

  return (
    <div>
      <h2>Tasks</h2>
      <ul>
        {data.allTasks.length > 0
          ? data.allTasks.map((task) => {
              return <li key={task.label}>{task.label}</li>;
            })
          : "No Tasks!"}
      </ul>
    </div>
  );
}

export default Tasks;

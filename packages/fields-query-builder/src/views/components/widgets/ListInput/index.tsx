import React, { useState, ChangeEvent, ClipboardEvent } from "react";
import { WidgetProps } from "@react-awesome-query-builder/ui";
import { Config } from "./config";

const ListInputWidget: React.FC<WidgetProps> = (props) => {
  const [list, setList] = useState<string[]>(props.value || []);

  const handleAdd = (): void => {
    setList([...list, ""]);
  };

  const handleChange = (index: number, newValue: string): void => {
    const newList = [...list];
    newList[index] = newValue;
    setList(newList);
    props.setValue(newList);
  };

  const handleRemove = (index: number): void => {
    const newList = list.filter((_, i) => i !== index);
    setList(newList);
    props.setValue(newList);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedValues = pastedData
      .split(/[,|\n|\r|\n\r|\r\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (pastedValues.length > 0) {
      // Check and remove the first item if it's blank before adding pasted values
      let newList = [...list];
      if (newList.length > 0 && newList[0] === "") {
        newList.shift(); // Remove the first item if it's blank
      }
      // Combine newList with pastedValues, filter for uniqueness
      newList = [...new Set([...newList, ...pastedValues])];
      setList(newList);
      props.setValue(newList);
    }
  };

  return (
    <div>
      {list.map((item, index) => (
        <div key={index}>
          <input
            type="text"
            value={item}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange(index, e.target.value)
            }
            onPaste={handlePaste}
            placeholder="Enter value" // Updated placeholder text
            aria-label="List item" // Added for accessibility
          />
          <button onClick={() => handleRemove(index)}>Remove</button>
        </div>
      ))}
      <button onClick={handleAdd}>Add Item</button>
    </div>
  );
};

export default Config;
export { ListInputWidget };

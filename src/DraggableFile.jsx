import React from "react";
import { useDrag, useDrop } from "react-dnd";

const DraggableFile = ({ file, index, moveFile }) => {
  const ref = React.useRef(null);

  // Drag functionality
  const [, drag] = useDrag({
    type: "FILE",
    item: { index },
  });

  // Drop functionality
  const [, drop] = useDrop({
    accept: "FILE",
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveFile(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  // Combine drag and drop refs
  drag(drop(ref));

  return (
    <li ref={ref} className="file-item">
      {file.name}
    </li>
  );
};

export default DraggableFile;


// main code
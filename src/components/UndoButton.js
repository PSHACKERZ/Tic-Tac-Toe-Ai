// src/components/UndoButton.js
import React from 'react';
import { RotateCcw } from 'lucide-react'; // Example icon

const UndoButton = ({ onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="bg-yellow-500 text-white px-3 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
  >
    <RotateCcw className="mr-1 sm:mr-2 w-4 h-4 sm:w-6 sm:h-6" /> 
    Undo
  </button>
);
export default UndoButton;

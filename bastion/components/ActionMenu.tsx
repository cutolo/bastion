'use client'
import React from 'react';
import { Action } from '../types/gameTypes';

interface ActionMenuProps {
  availableActions: Action[];
  onAction: (action: Action) => void;
  disabled: boolean;
}

export default function ActionMenu({ availableActions, onAction, disabled }: ActionMenuProps) {
  return (
    <div className="action-menu flex flex-col space-y-2">
      {(['move', 'attack', 'activate'] as Action[]).map((action) => (
        <button
          key={action}
          className={`px-4 py-2 rounded capitalize ${
            availableActions.includes(action) && !disabled
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          onClick={() => onAction(action)}
          disabled={!availableActions.includes(action) || disabled}
        >
          {action}
        </button>
      ))}
    </div>
  );
}


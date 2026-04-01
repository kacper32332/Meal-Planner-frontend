import React from "react";
import SpotlightCard from "../SpotlightCard";

function ShoppingListModal({ 
  list, 
  onClose, 
  onToggleItem, 
  onRemoveItem, 
  onClearCompleted, 
  onClearAll 
}) {
  return (
    <div className="fixed inset-0 bg-gunmetal-500/80 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
      <SpotlightCard>
        <div className="bg-gunmetal-300 rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-400">Shopping List ({list.length})</h2>
            <button onClick={onClose} className="text-white hover:text-blue-400 text-2xl font-bold">×</button>
          </div>
          
          {list.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">Your shopping list is empty</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                {list.map((item) => (
                  <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg border-2 ${item.completed ? 'bg-green-500/20 border-green-500/30' : 'bg-gunmetal-400/50 border-office-green-500/30'}`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <input type="checkbox" checked={item.completed} onChange={() => onToggleItem(item.id)} className="w-5 h-5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className={`font-medium truncate ${item.completed ? 'line-through text-gray-400' : 'text-white'}`}>{item.name}</p>
                        <p className="text-xs text-gray-400 truncate">From: {item.recipe}</p>
                      </div>
                    </div>
                    <button onClick={() => onRemoveItem(item.id)} className="text-red-400 hover:text-red-300 font-bold text-lg ml-2">×</button>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-4">
                <button onClick={onClearCompleted} disabled={!list.some(i => i.completed)} className="px-4 py-2 rounded-full border-2 border-green-400 text-green-400 hover:bg-green-500 hover:text-white disabled:opacity-50">Clear Completed</button>
                <button onClick={onClearAll} className="px-4 py-2 rounded-full border-2 border-red-400 text-red-400 hover:bg-red-500 hover:text-white">Clear All</button>
              </div>
            </>
          )}
        </div>
      </SpotlightCard>
    </div>
  );
}

export default ShoppingListModal;
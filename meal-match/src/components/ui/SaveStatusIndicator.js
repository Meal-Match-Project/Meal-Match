export default function SaveStatusIndicator({ isSaving, lastSaved }) {
  return (
    <span>
      {isSaving ? 
        <span className="text-orange-600">Saving changes...</span> : 
        <span className="text-green-600">
          {lastSaved ? 
            `All changes saved ${lastSaved.toLocaleTimeString()}` :
            "No changes to save"
          }
        </span>
      }
    </span>
  );
}
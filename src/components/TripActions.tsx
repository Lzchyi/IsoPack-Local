import React from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Edit3, Upload, Users, LogOut } from 'lucide-react';

interface TripActionsProps {
  isOwner: boolean;
  onEdit: () => void;
  onExport: () => void;
  onDelete: () => void;
}

export const TripActions: React.FC<TripActionsProps> = ({ 
  isOwner, 
  onEdit, 
  onExport, 
  onDelete 
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      {isOwner && (
        <button
          onClick={onEdit}
          className="w-10 h-10 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium rounded-xl transition-colors flex items-center justify-center"
          title={t('common.edit')}
          aria-label={t('common.edit')}
        >
          <Edit3 className="w-4 h-4" />
        </button>
      )}
      <button
        onClick={onExport}
        className="w-10 h-10 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium rounded-xl transition-colors flex items-center justify-center"
        title={t('common.export')}
        aria-label={t('common.export')}
      >
        <Upload className="w-4 h-4" />
      </button>
      <button
        onClick={onDelete}
        className="w-10 h-10 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-medium rounded-xl transition-colors flex items-center justify-center"
        title={t('common.delete')}
        aria-label={t('common.delete')}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

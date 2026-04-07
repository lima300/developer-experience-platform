import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@dxp/ui';
import React, { useState } from 'react';

import { useDeleteFlag } from '../api/flags.hooks.js';

interface DeleteFlagConfirmProps {
  flagId: string;
  flagName: string;
  onClose: () => void;
}

export function DeleteFlagConfirm({ flagId, flagName, onClose }: DeleteFlagConfirmProps) {
  const [open, setOpen] = useState(false);
  const deleteFlag = useDeleteFlag();

  function handleDelete() {
    deleteFlag.mutate(flagId, {
      onSuccess: () => {
        setOpen(false);
        onClose();
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        Delete
      </Button>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete flag?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-dxp-muted-foreground">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-900 dark:text-white">{flagName}</span>? This
          action cannot be undone.
        </p>
        {deleteFlag.isError && (
          <p className="text-xs text-dxp-destructive">Failed to delete flag. Please try again.</p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteFlag.isPending}>
            {deleteFlag.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useForm } from "react-hook-form";
import type { Agent, AgentFormData } from "../../types/agent";

interface EditAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: string, data: AgentFormData) => Promise<void>;
  agent: Agent | null;
}

export const EditAgentModal: React.FC<EditAgentModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  agent,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AgentFormData>();

  useEffect(() => {
    if (agent) {
      reset({
        name: agent.name,
        version: agent.version,
      });
    }
  }, [agent, reset]);

  const onSubmit = async (data: AgentFormData) => {
    if (!agent) return;

    try {
      await onEdit(agent.id, data);
      reset();
    } catch (error) {
      console.error("Failed to update agent:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Agent</DialogTitle>
          <DialogDescription>
            Modify the agent's details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Agent Name</Label>
            <Input
              id="name"
              {...register("name", {
                required: "Agent name is required",
                minLength: {
                  value: 3,
                  message: "Agent name must be at least 3 characters",
                },
              })}
              placeholder="e.g., Production Server 1"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="version">Version</Label>
            <Input
              id="version"
              {...register("version")}
              placeholder="e.g., 1.0.0"
            />
            {errors.version && (
              <p className="text-sm text-destructive">
                {errors.version.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

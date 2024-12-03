import React from "react";
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
import type { AgentFormData } from "../../types/agent";

interface DeployAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: (data: AgentFormData) => Promise<void>;
}

export const DeployAgentModal: React.FC<DeployAgentModalProps> = ({
  isOpen,
  onClose,
  onDeploy,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AgentFormData>();

  const onSubmit = async (data: AgentFormData) => {
    try {
      await onDeploy(data);
      reset();
    } catch (error) {
      console.error("Failed to deploy agent:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deploy New Agent</DialogTitle>
          <DialogDescription>
            Enter the details for the new security monitoring agent.
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
              {isSubmitting ? "Deploying..." : "Deploy Agent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

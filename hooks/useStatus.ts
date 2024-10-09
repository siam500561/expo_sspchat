import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";

export const useStatus = () => {
  const onlineMutation = useMutation(api.online.set);
  const typingMutation = useMutation(api.typing.set);

  const handleOnline = async (id: Id<"online">, online: boolean) => {
    await onlineMutation({
      id,
      online,
    });
  };

  const handleTyping = async (id: Id<"typing">, typing: boolean) => {
    await typingMutation({
      id,
      typing,
    });
  };

  return { handleOnline, handleTyping };
};

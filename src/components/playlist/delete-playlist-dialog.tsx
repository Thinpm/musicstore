import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { playlistService } from "@/services/playlistService";

interface DeletePlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playlistId: string;
  onSuccess?: () => void;
}

export function DeletePlaylistDialog({
  open,
  onOpenChange,
  playlistId,
  onSuccess
}: DeletePlaylistDialogProps) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!playlistId) {
      toast.error("ID playlist không hợp lệ");
      return;
    }

    try {
      setLoading(true);
      await playlistService.deletePlaylist(playlistId);
      toast.success("Đã xóa playlist thành công");
      onSuccess?.();
      navigate("/playlists");
    } catch (error) {
      console.error("Error deleting playlist:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Không thể xóa playlist. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Playlist này sẽ bị xóa vĩnh viễn.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {loading ? "Đang xóa..." : "Xóa playlist"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 
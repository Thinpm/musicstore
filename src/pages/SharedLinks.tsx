import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Music, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/auth-provider";

interface SharedLink {
  token: string;
  songTitle: string;
  artist: string;
  sharedBy: string;
  hasAccess: boolean;
}

export default function SharedLinks() {
  const [inputLink, setInputLink] = useState("");
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleAddLink = async () => {
    if (!user) {
      toast({
        title: "Chưa đăng nhập",
        description: "Vui lòng đăng nhập để sử dụng tính năng này",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Trích xuất token từ URL
      const token = inputLink.split("/").pop();
      if (!token) {
        throw new Error("Link không hợp lệ");
      }

      // Kiểm tra xem link đã được thêm chưa
      const exists = sharedLinks.some(link => link.token === token);
      if (exists) {
        throw new Error("Link này đã được thêm trước đó");
      }

      // Lấy thông tin share từ token
      const { data: shareData, error: shareError } = await supabase
        .from('shared_files')
        .select(`
          permissions, 
          shared_with_email, 
          shared_by,
          songs!inner (
            id,
            title,
            artist,
            user_id
          ),
          profiles!shared_by (
            email
          )
        `)
        .eq('token', token)
        .eq('is_active', true)
        .maybeSingle();

      if (shareError || !shareData) {
        throw new Error("Link chia sẻ không hợp lệ hoặc đã hết hạn");
      }

      // Kiểm tra quyền truy cập
      const hasAccess = !shareData.shared_with_email || 
                       (user.email === shareData.shared_with_email);

      const newLink: SharedLink = {
        token,
        songTitle: shareData.songs.title,
        artist: shareData.songs.artist || "Unknown Artist",
        sharedBy: shareData.profiles.email,
        hasAccess
      };

      setSharedLinks(prev => [newLink, ...prev]);
      setInputLink("");
      
      toast({
        title: "Thành công",
        description: "Đã thêm link chia sẻ",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể thêm link. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Bài hát được chia sẻ</h1>

      {/* Form nhập link */}
      <div className="flex gap-4 mb-8">
        <Input
          placeholder="Nhập link chia sẻ vào đây"
          value={inputLink}
          onChange={(e) => setInputLink(e.target.value)}
          className="flex-1"
        />
        <Button 
          onClick={handleAddLink} 
          disabled={!inputLink || loading || !user}
        >
          Thêm link
        </Button>
      </div>

      {!user && (
        <div className="text-center text-yellow-600 dark:text-yellow-400 mb-8">
          Vui lòng đăng nhập để sử dụng tính năng này
        </div>
      )}

      {/* Danh sách các link đã thêm */}
      <div className="space-y-4">
        {sharedLinks.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Chưa có link chia sẻ nào được thêm
          </div>
        ) : (
          sharedLinks.map((link) => (
            <Card key={link.token}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Music className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{link.songTitle}</h3>
                    <p className="text-sm text-muted-foreground">
                      {link.artist} • Được chia sẻ bởi {link.sharedBy}
                    </p>
                    {!link.hasAccess && (
                      <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                        Bạn không có quyền truy cập bài hát này
                      </p>
                    )}
                  </div>
                </div>
                <Link 
                  to={`/share/${link.token}`}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <span>Xem</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 
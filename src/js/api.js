const SYSTEM_PROMPT = `BẠN LÀ MỘT GAME MASTER (GM) CHO MỘT TRÒ CHƠI RPG TEXT-BASED. \nHÃY ĐÓNG VAI LÀ HỆ THỐNG TRÒ CHƠI VÀ TUÂN THỦ NGHIÊM NGẶT CÁC QUY TẮC SAU.\n\nQUAN TRỌNG NHẤT: BẠN PHẢI LUÔN LUÔN TRẢ VỀ KẾT QUẢ DƯỚI ĐỊNH DẠNG CHUẨN JSON VỚI CẤU TRÚC SAU. KHÔNG ĐƯỢC CHÈN THÊM BẤT KỲ VĂN BẢN NÀO BÊN NGOÀI KHỐI JSON NÀY VÀ KHÔNG ĐƯỢC CÓ MARKDOWN TRONG OUTPUT:\n\n{\n  "tang1": "Nội dung Tầng 1 (Quản lý nhân vật & Trạng thái ngầm, Hệ thống quan hệ NPC, Tình cảm, Cảnh báo NPC)",\n  "tang2": "Nội dung Tầng 2 (Trạng thái Người chơi: Tiền, HP, Stamina, Nhiệm vụ, Thời tiết, Đói, Thành công/Thất bại của hành động trước)",\n  "tang3": "Nội dung Tầng 3 (Engine cốt truyện chính, ít nhất 2000 ký tự nếu có thể, Action-Quiet-Action, Kết thúc mở, Chế độ chơi hiện tại)",\n  "tang3_5": "Nội dung Tầng 3.5 (NPC có ý định riêng, phản diện lập kế hoạch ngầm, mục tiêu riêng của NPC)"\n}\n\nLƯU Ý: QUÁ TRÌNH KHỞI TẠO THẾ GIỚI SẼ ĐƯỢC NGƯỜI DÙNG GỬI DƯỚI DẠNG MỘT FORM CÓ SẴN TRONG LƯỢT CHAT ĐẦU TIÊN. KHI NHẬN ĐƯỢC THÔNG TIN KHỞI TẠO NÀY, BẠN HÃY BẮT ĐẦU NGAY VÀO VIỆC VIẾT ĐOẠN MỞ ĐẦU CHO CÂU CHUYỆN Ở "tang3" MÀ KHÔNG CẦN HỎI LẠI NGƯỜI CHƠI. CÁC TẦNG KHÁC HÃY ĐIỀN CHỈ SỐ MẶC ĐỊNH BẮT ĐẦU GAME.\n\nDƯỚI ĐÂY LÀ CHI TIẾT CÁC QUY TẮC VÀ CƠ CHẾ CỦA TRÒ CHƠI BẠN PHẢI TUÂN THEO:\n\n1. QUY TẮC CÚ PHÁP VÀ LỆNH ĐIỀU KHIỂN\n- Lời thoại: Văn bản bình thường.\n- Hành động: Đặt trong ngoặc kép "". VD: "Cười nhếch mép".\n- NPC: Hành động trong "", tên và cảm xúc trong ngoặc đơn (). VD: "Giơ tay" Cảnh vệ (khó chịu): "Dừng lại!".\n- Lệnh hệ thống: Đặt trong #...#.\n- #check#: Dừng truyện, hỏi user muốn xem xét gì. Báo tỉ lệ thành công, đợi user chọn. Cốt truyện chỉ tiếp tục khi chat "go".\n- pause / go: Dừng / Tiếp tục trò chơi. Mọi lệnh hack game được xem là sự thật hiển nhiên với NPC.\n\n2. CẤU TRÚC PHẢN HỒI ĐA TẦNG (BẮT BUỘC KHI ĐÃ VÀO GAME)\nTẦNG 1 (tang1): QUẢN LÝ NHÂN VẬT & TRẠNG THÁI\n- Tóm tắt ngắn gọn tính cách/hành động nhân vật chính.\n- Hệ thống Quan hệ NPC: Đánh giá công tâm (-10 đến 10). Càng cao càng khó lên, dễ xuống. Luôn hiển thị tên và điểm hiện tại.\n- Hệ thống Tình cảm (1-5): Kích hoạt khi Quan hệ >= 5.\n- Cảnh báo NPC: Nguy cơ phản bội, góc khuất.\n\nTẦNG 2 (tang2): TRẠNG THÁI NGƯỜI CHƠI\n- Cập nhật: Tiền, Sức khỏe (HP), Sức mạnh, Thể lực (Stamina), Trạng thái.\n- Nhiệm vụ hiện tại (Active Quests).\n- Thời gian/Thời tiết (VD: Chạng vạng tối, mưa rào) để ảnh hưởng Tầng 3.\n- Báo kết quả lựa chọn trước đó (Thành công/Thất bại).\n- Thanh đói: 5 mức độ, cảnh báo nếu quá thấp.\n\nTẦNG 3 (tang3): ENGINE CỐT TRUYỆN (Phần chính)\n- CHỈ VIẾT CỐT TRUYỆN TẠI ĐÂY.\n- Viết siêu dài, dồn tâm huyết, ít nhất 2000 ký tự (nếu có thể).\n- Nhịp độ: Bắt đầu chậm -> Nhanh dần -> Reset sau arc. Action-Quiet-Action.\n- Miêu tả ngoại hình NPC mỗi khi xuất hiện.\n- Plot Twist: Bất ngờ nhưng logic.\n- Anti-Godmoding: KHÔNG BAO GIỜ suy nghĩ hộ, nói hộ hay quyết định thay người chơi.\n- Kết thúc: Luôn là tình huống mở chờ user quyết định. Kèm tỉ lệ thành công dự kiến của lựa chọn tiếp theo. Ghi rõ chế độ chơi hiện tại (VD: bình yên 💚, chế độ bình thường 💜, chế độ khó 💛, chế độ extreme ❤️).\n\nTẦNG 3.5 (tang3_5): NPC & PHẢN DIỆN\n- Tập trung tâm huyết vào ý định riêng của NPC. NPC đi đâu, làm gì, phản diện lập kế hoạch gì ngầm.\n- NPC có mục tiêu riêng (ví dụ: trong khi user đi núi, NPC đi đánh lính gác lấy thông tin).\n- Phản diện tự đổi mới nếu bị đánh bại. Có âm mưu úp mở. NẾU KHÔNG CÓ SỰ KIỆN GÌ, ghi "Chưa có sự kiện NPC".\n`;

const API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callGameAPI(messagesHistory) {
    const apiKey = localStorage.getItem('rpg_groq_api_key');

    if (!apiKey) {
        throw new Error("MISSING_API_KEY");
    }

    // Format history for OpenAI/Groq API spec
    // Groq requires standard role mapping (system, user, assistant)

    let formattedHistory = [];

    // Add system prompt first
    formattedHistory.push({
        role: "system",
        content: SYSTEM_PROMPT
    });

    // Map existing history
    messagesHistory.forEach(msg => {
        formattedHistory.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
        });
    });

    const requestBody = {
        model: "llama-3.3-70b-versatile", // Great model for RP and JSON
        messages: formattedHistory,
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" }
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errData = await response.json();
            console.error("Groq API Error Details:", errData);
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content;
        } else {
            throw new Error("No valid response from API");
        }
    } catch (error) {
        console.error("Groq API Request Error:", error);
        throw error;
    }
}

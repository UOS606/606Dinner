import com.team606.mrdinner.dto.CouponInfoResponseDto;
import com.team606.mrdinner.dto.CouponUseRequestDto;
import com.team606.mrdinner.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class CouponController {

    private final OrderService orderService;

    // Cart.jsx: GET /api/coupons
    @GetMapping("/coupons")
    public CouponInfoResponseDto myCoupons(@AuthenticationPrincipal String username) {
        return orderService.getMyCouponInfo(username);
    }

    // Cart.jsx: POST /api/coupons  body: { action:"use", usedCount }
    @PostMapping("/coupons")
    public void useCoupons(@AuthenticationPrincipal String username,
                           @RequestBody CouponUseRequestDto req) {
        if (!"use".equalsIgnoreCase(req.getAction())) {
            throw new IllegalArgumentException("지원하지 않는 action");
        }
        orderService.useCoupons(username, req.getUsedCount());
    }
}

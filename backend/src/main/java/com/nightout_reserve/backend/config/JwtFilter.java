package com.nightout_reserve.backend.config;

import com.nightout_reserve.backend.utils.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws jakarta.servlet.ServletException, java.io.IOException {
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            username = jwtUtil.getUsernameFromToken(token);
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtUtil.validateToken(token)) {
                Integer userId = jwtUtil.getUserIdFromToken(token); // Get userId from token
                // Create a custom principal object or use username + userId
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                new CustomUserPrincipal(username, userId), // Custom principal
                                null, // Credentials not needed after token validation
                                null  // Add roles/authorities here if needed
                        );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        chain.doFilter(request, response);
    }
}
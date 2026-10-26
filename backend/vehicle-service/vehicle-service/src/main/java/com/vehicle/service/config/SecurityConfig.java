
package com.vehicle.service.config;

import com.vehicle.service.security.JwtAuthenticationFilter;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Prevent duplicate JWT filter registration.
    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter> jwtFilterRegistration(
            JwtAuthenticationFilter filter) {

        FilterRegistrationBean<JwtAuthenticationFilter> registration =
                new FilterRegistrationBean<>(filter);

        registration.setEnabled(false);
        return registration;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .cors(Customizer.withDefaults())

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            .authorizeHttpRequests(auth -> auth

                // CORS preflight requests
                .requestMatchers(HttpMethod.OPTIONS, "/**")
                    .permitAll()

                // Spring Boot error endpoint
                .requestMatchers("/error")
                    .permitAll()

                // Customer registration and login
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/auth/register",
                    "/api/auth/login"
                ).permitAll()

                // Admin login
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/admin/auth/login"
                ).permitAll()

                // Technician login/registration
                // Confirm these paths match your controllers.
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/technician/auth/login",
                    "/api/technician/auth/register"
                ).permitAll()

                // Admin APIs
                .requestMatchers("/api/admin/**")
                    .hasRole("ADMIN")

                // Technician APIs
                .requestMatchers("/api/technician/**")
                    .hasRole("TECHNICIAN")

                // Customer APIs
                .requestMatchers("/api/customer/**")
                    .hasRole("CUSTOMER")

                // Customer profile
                .requestMatchers("/api/auth/me")
                    .hasRole("CUSTOMER")

                // Deny endpoints not explicitly configured
                .anyRequest()
                    .denyAll()
            )

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}

package com.erp.user;

import com.erp.user.dto.CreateUserRequest;
import com.erp.user.dto.UpdateUserRequest;
import com.erp.user.dto.UserResponse;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public Page<UserResponse> getAllUsers(String search, Role role, Boolean isActive, Pageable pageable) {
        return userRepository.findAllWithFilters(search, role, isActive, pageable)
                .map(userMapper::toResponse);
    }

    public UserResponse getUserById(UUID id) {
        User user = findUserOrThrow(id);
        return userMapper.toResponse(user);
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(request.getRole())
                .isActive(true)
                .build();

        user.setIsDeleted(false);
        userRepository.save(user);
        log.info("User created: {} with role {}", user.getEmail(), user.getRole());

        return userMapper.toResponse(user);
    }

    @Transactional
    public UserResponse updateUser(UUID id, UpdateUserRequest request) {
        User user = findUserOrThrow(id);

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email already in use: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }
        if (request.getPassword() != null) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }

        userRepository.save(user);
        log.info("User updated: {}", user.getEmail());

        return userMapper.toResponse(user);
    }

    @Transactional
    public void deactivateUser(UUID id) {
        User user = findUserOrThrow(id);
        user.setIsActive(false);
        userRepository.save(user);
        log.info("User deactivated: {}", user.getEmail());
    }

    @Transactional
    public void activateUser(UUID id) {
        User user = findUserOrThrow(id);
        user.setIsActive(true);
        userRepository.save(user);
        log.info("User activated: {}", user.getEmail());
    }

    @Transactional
    public void deleteUser(UUID id) {
        User user = findUserOrThrow(id);
        user.setIsDeleted(true);
        user.setIsActive(false);
        userRepository.save(user);
        log.info("User soft-deleted: {}", user.getEmail());
    }

    public UserStats getUserStats() {
        long total = userRepository.countByIsDeletedFalse();
        long active = userRepository.countByIsActiveAndIsDeletedFalse(true);
        long admins = userRepository.countByRoleAndIsDeletedFalse(Role.ADMIN);
        long managers = userRepository.countByRoleAndIsDeletedFalse(Role.MANAGER);
        long employees = userRepository.countByRoleAndIsDeletedFalse(Role.EMPLOYEE);

        return UserStats.builder()
                .totalUsers(total)
                .activeUsers(active)
                .inactiveUsers(total - active)
                .adminCount(admins)
                .managerCount(managers)
                .employeeCount(employees)
                .build();
    }

    private User findUserOrThrow(UUID id) {
        return userRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
    }
}

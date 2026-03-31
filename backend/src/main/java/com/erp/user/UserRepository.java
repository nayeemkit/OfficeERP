package com.erp.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailAndIsDeletedFalse(String email);

    Optional<User> findByIdAndIsDeletedFalse(UUID id);

    boolean existsByEmail(String email);

    @Query("""
        SELECT u FROM User u
        WHERE u.isDeleted = false
        AND (:search IS NULL OR :search = ''
            OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:role IS NULL OR u.role = :role)
        AND (:isActive IS NULL OR u.isActive = :isActive)
    """)
    Page<User> findAllWithFilters(
            @Param("search") String search,
            @Param("role") Role role,
            @Param("isActive") Boolean isActive,
            Pageable pageable
    );

    long countByIsDeletedFalse();

    long countByRoleAndIsDeletedFalse(Role role);

    long countByIsActiveAndIsDeletedFalse(Boolean isActive);
}

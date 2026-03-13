package com.clt.repository;

import com.clt.entity.Order;
import com.clt.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    /** Method query: último pedido con código que empieza por prefix (ej. ORD-2024). */
    Optional<Order> findFirstByCodigoStartingWithOrderByCodigoDesc(String prefix);

    /** JPQL: ejemplo de consulta por estado. */
    @Query("SELECT o FROM OrderEntity o WHERE o.estado = :estado ORDER BY o.fechaCreacion DESC")
    List<Order> findByEstadoJpql(@Param("estado") OrderStatus estado);
}

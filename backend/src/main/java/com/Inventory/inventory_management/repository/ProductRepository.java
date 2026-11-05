package com.Inventory.inventory_management.repository;
import com.Inventory.inventory_management.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

}
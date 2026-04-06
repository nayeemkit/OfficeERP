package com.erp.inventory.stock;

import com.erp.inventory.item.InventoryEnums;
import com.erp.inventory.item.Item;
import com.erp.inventory.item.ItemRepository;
import com.erp.inventory.stock.dto.StockTransactionRequest;
import com.erp.inventory.stock.dto.StockTransactionResponse;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockService {

    private final StockTransactionRepository transactionRepository;
    private final ItemRepository itemRepository;

    public Page<StockTransactionResponse> getTransactions(UUID itemId, InventoryEnums.StockTransactionType type,
                                                           LocalDate dateFrom, LocalDate dateTo, Pageable pageable) {
        return transactionRepository.findAllWithFilters(itemId, type, dateFrom, dateTo, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public StockTransactionResponse createTransaction(StockTransactionRequest request) {
        Item item = itemRepository.findByIdAndIsDeletedFalse(request.getItemId())
                .orElseThrow(() -> new EntityNotFoundException("Item not found"));

        // Validate stock out
        if (request.getType() == InventoryEnums.StockTransactionType.OUT) {
            if (item.getCurrentStock() < request.getQuantity()) {
                throw new IllegalArgumentException(
                        String.format("Insufficient stock. Available: %d, Requested: %d",
                                item.getCurrentStock(), request.getQuantity()));
            }
        }

        BigDecimal unitPrice = request.getUnitPrice() != null ? request.getUnitPrice() : item.getUnitPrice();
        BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(request.getQuantity()));

        StockTransaction txn = StockTransaction.builder()
                .item(item)
                .type(request.getType())
                .quantity(request.getQuantity())
                .unitPrice(unitPrice)
                .totalPrice(totalPrice)
                .reference(request.getReference())
                .note(request.getNote())
                .transactionDate(request.getTransactionDate() != null ? request.getTransactionDate() : LocalDate.now())
                .build();
        txn.setIsDeleted(false);

        transactionRepository.save(txn);

        // Update stock
        switch (request.getType()) {
            case IN -> item.setCurrentStock(item.getCurrentStock() + request.getQuantity());
            case OUT -> item.setCurrentStock(item.getCurrentStock() - request.getQuantity());
            case ADJUSTMENT -> item.setCurrentStock(request.getQuantity());
        }
        itemRepository.save(item);

        log.info("Stock {}: {} x{} (stock now: {})", request.getType(), item.getSku(),
                request.getQuantity(), item.getCurrentStock());

        return toResponse(txn);
    }

    private StockTransactionResponse toResponse(StockTransaction st) {
        return StockTransactionResponse.builder()
                .id(st.getId())
                .itemId(st.getItem().getId())
                .itemName(st.getItem().getName())
                .itemSku(st.getItem().getSku())
                .categoryName(st.getItem().getCategory() != null ? st.getItem().getCategory().getName() : null)
                .type(st.getType())
                .quantity(st.getQuantity())
                .unitPrice(st.getUnitPrice())
                .totalPrice(st.getTotalPrice())
                .reference(st.getReference())
                .note(st.getNote())
                .transactionDate(st.getTransactionDate())
                .createdAt(st.getCreatedAt())
                .build();
    }
}

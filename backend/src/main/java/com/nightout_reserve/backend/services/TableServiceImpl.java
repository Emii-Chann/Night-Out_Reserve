// package com.nightout_reserve.backend.services;

// import com.nightout_reserve.backend.models.Table;
// import com.nightout_reserve.backend.repositories.TableRepository;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;

// import java.time.LocalDateTime;
// import java.util.List;

// @Service
// public class TableServiceImpl implements TableService{

//     @Autowired
//     private TableRepository tableRepository;


//     @Override
//     public Table getTableById(Integer id) {
//         return tableRepository.findById(id).orElseThrow(()->new RuntimeException("No table found with id: "+id));
//     }

//     @Override
//     public List<Table> getAllTables() {
//         return tableRepository.findAll();
//     }

//     @Override
//     public List<Table> getAllTablesByVenueId(Integer id) {
//         return tableRepository.findByVenueId(id) ;
//     }

//     @Override
//     public List<Table> getAllAvailableTablesByVenueId(Integer venueId, Integer seatsWanted) {
//         List<Table> tables = tableRepository.findByVenueId(venueId);

//         return tables.stream().filter(table -> table.getSeats() > table.getSeatsReserved()).toList();
//     }

//     @Override
//     public Table createTable(Table tableToCreate) {
//         return tableRepository.save(tableToCreate);
//     }

//     @Override
//     public Table updateTableById(Integer tableId, Table body) {
//         Table tableToUpdate = tableRepository.findById(tableId).orElseThrow(() -> new RuntimeException("Table with id:" + tableId + " not found"));

//         if (body.getSeats() != null){
//             tableToUpdate.setSeats(body.getSeats());
//         } else {
//             tableToUpdate.setSeats(tableToUpdate.getSeats());
//         }
//         if (body.getSeatsReserved() != null){
//             tableToUpdate.setSeatsReserved(body.getSeatsReserved());
//         } else {
//             tableToUpdate.setSeatsReserved(tableToUpdate.getSeatsReserved());
//         }

//         return tableRepository.save(tableToUpdate);
//     }

//     @Override
//     public Table softDeleteTableById(Integer id) {
//         Table tableToSoftDelete = tableRepository.findById(id).orElseThrow(() -> new RuntimeException("Table with id:"+id+" not found"));

//         tableToSoftDelete.setIsDeleted(true);
//         tableToSoftDelete.setDeletedAt(LocalDateTime.now());

//         return tableRepository.save(tableToSoftDelete);

//     }

//     @Override
//     public void hardDeleteTableById(Integer id) {
//         tableRepository.deleteById(id);
//         System.out.println("Deleted table with id: "+id);
//     }
// }

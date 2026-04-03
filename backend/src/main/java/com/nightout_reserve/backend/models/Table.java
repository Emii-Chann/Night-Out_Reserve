// package com.nightout_reserve.backend.models;

// import jakarta.persistence.*;
// import lombok.AllArgsConstructor;
// import lombok.Getter;
// import lombok.NoArgsConstructor;
// import lombok.Setter;

// import java.time.LocalDateTime;


// @Getter
// @Setter
// @Entity
// @NoArgsConstructor
// @AllArgsConstructor
// @jakarta.persistence.Table(name = "asztalok")
// public class Table {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     @Column(name = "id")
//     private Integer id;

//     @ManyToOne(fetch = FetchType.EAGER)
//     @JoinColumn(name = "szorakozohely_id", nullable = false)
//     private Venue venue;

//     @Column(name = "elfoglalt_ferohely", nullable = false, length = 11)
//     private Integer seatsReserved;

//     @Column(name = "ferohely", nullable = false, length = 11)
//     private Integer seats;

//     @Column(name = "torolve", nullable = false, length = 1)
//     private Boolean isDeleted;

//     @Column(name = "torolve_at")
//     private LocalDateTime deletedAt;

//     @PrePersist
//     void onCreate(){
//         if(isDeleted == null || isDeleted){
//             isDeleted = true;
//         } else {
//             isDeleted = false;
//         }

//     }
// }
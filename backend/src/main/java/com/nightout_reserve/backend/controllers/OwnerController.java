package com.nightout_reserve.backend.controllers;

import com.nightout_reserve.backend.models.Owner;
import com.nightout_reserve.backend.services.OwnerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/owners")
public class OwnerController {

        @Autowired
        private OwnerService ownerService;

        @GetMapping("/")
        public List<Owner> getAllOwners(){
            return ownerService.getAllOwners();
        }

        @GetMapping("/id/{ownerId}")
        public Owner getOwnerById(@PathVariable Integer ownerId){
            return ownerService.getOwnerById(ownerId);
        }


        @GetMapping("/email/{ownerEmail}")
        public Owner getOwnerByEmail(@PathVariable String ownerEmail){
            return ownerService.getOwnerByEmail(ownerEmail);
        }

        @GetMapping("/phone/{ownerPhone}")
        public Owner getOwnerById(@PathVariable String ownerPhone){
            return ownerService.getOwnerByPhone(ownerPhone);
        }


        @GetMapping("/search/{usernameLike}")
        public List<Owner> getOwnersByUsernameLike(@PathVariable String usernameLike){
            return ownerService.getOwnersByUsernameLike(usernameLike);
        }

        @PostMapping("/create")
        public Owner createOwner(@RequestBody Owner owner){
            return ownerService.createOwner(owner);
        }

        @PutMapping("/update/{ownerId}")
        public Owner updateOwner(@PathVariable Integer ownerId,@RequestBody Owner owner){
            return ownerService.updateOwnerById(ownerId, owner);
        }


        @PatchMapping("/softDelete/{ownerId}")
        public Owner softDeleteOwner(@PathVariable Integer ownerId){
            return ownerService.softDeleteOwnerById(ownerId);
        }

        @DeleteMapping("/hardDelete/{ownerId}")
        public String hardDeleteOwner(@PathVariable Integer ownerId){
            ownerService.hardDeleteOwnerById(ownerId);

            return  "owner with id: "+ownerId+" successfully deleted";
        }

}

package com.nightout_reserve.backend.services;

import com.nightout_reserve.backend.models.Owner;
import com.nightout_reserve.backend.repositories.OwnerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OwnerServiceImpl implements OwnerService {
    @Autowired
    private OwnerRepository ownerRepository;


    @Override
    public Owner getOwnerById(Integer id) {
        return ownerRepository.findById(id).orElseThrow(() -> new RuntimeException("Owner with id: "+ id+ "not found"));
    }

    @Override
    public Owner getOwnerByEmail(String email) {
        return ownerRepository.findByEmail(email);
    }

    @Override
    public Owner getOwnerByPhone(String phone) {
        return ownerRepository.getOwnerByPhone(phone);
    }

    @Override
    public List<Owner> getAllOwners() {
        return ownerRepository.findAll();
    }

    @Override
    public List<Owner> getOwnersByUsernameLike(String searchByUsername) {
        return ownerRepository.findByUsernameLike(searchByUsername);
    }

    @Override
    public Owner createOwner(Owner ownerToCreate) {
        return ownerRepository.save(ownerToCreate);
    }

    @Override
    public Owner updateOwnerById(Integer ownerId, Owner body) {
        Owner ownerToUpdate = ownerRepository.findById(ownerId).orElseThrow(() -> new RuntimeException("Owner with id: "+ ownerId+ "not found"));

        ownerToUpdate.setUsername(body.getUsername());
        ownerToUpdate.setEmail(body.getEmail());
        ownerToUpdate.setCompanyName(body.getCompanyName());


        return ownerRepository.save(ownerToUpdate);
    }

    @Override
    public Owner softDeleteOwnerById(Integer id) {
        Owner ownerToSoftDelete = ownerRepository.findById(id).orElseThrow(() -> new RuntimeException("Owner with id: "+ id+ "not found"));

        ownerToSoftDelete.setIsDeleted(true);
        ownerToSoftDelete.setDeletedAt(LocalDateTime.now());


        return ownerRepository.save(ownerToSoftDelete);
    }

    @Override
    public void hardDeleteOwnerById(Integer id) {
        System.out.println("Deleting owner with id "+ id);
        ownerRepository.deleteById(id);
    }
}

package com.nightout_reserve.backend.services;

import com.nightout_reserve.backend.models.Owner;

import java.util.List;

public interface OwnerService {
    Owner getOwnerById(Integer id);
    Owner getOwnerByEmail(String email);
    Owner getOwnerByPhone(String phone);
    List<Owner> getAllOwners();
    List<Owner> getOwnersByUsernameLike(String searchByUsername);

    //create
    Owner createOwner(Owner ownerToCreate);


    //update
    Owner updateOwnerById(Integer ownerId, Owner body);

    //delete
    Owner softDeleteOwnerById(Integer id);
    void hardDeleteOwnerById(Integer id);
}

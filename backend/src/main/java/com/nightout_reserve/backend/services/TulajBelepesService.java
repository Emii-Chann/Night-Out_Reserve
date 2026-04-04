package com.nightout_reserve.backend.services;

import com.nightout_reserve.backend.models.TulajBelepes;

public interface TulajBelepesService {
    TulajBelepes login(String felhasznalonev, String jelszo);
}
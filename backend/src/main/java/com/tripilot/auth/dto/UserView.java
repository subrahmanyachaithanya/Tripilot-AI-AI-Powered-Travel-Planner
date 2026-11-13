package com.tripilot.auth.dto;

import com.tripilot.auth.model.UserAccount;

public class UserView {
    private final Long id;
    private final String fullName;
    private final String email;
    private final String pictureUrl;

    public UserView(UserAccount user) {
        this.id = user.getId();
        this.fullName = user.getFullName();
        this.email = user.getEmail();
        this.pictureUrl = user.getPictureUrl();
    }

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getPictureUrl() { return pictureUrl; }
}

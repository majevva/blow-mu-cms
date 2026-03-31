package io.github.felipeemerson.openmuapi.entities;

import io.github.felipeemerson.openmuapi.enums.SocialMediaPlatform;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "\"SocialMediaLink\"", schema = "cms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SocialMediaLink {

    @Id
    @Enumerated(EnumType.STRING)
    @Column(name = "\"Platform\"")
    private SocialMediaPlatform platform;

    @Column(name = "\"Url\"")
    private String url;
}

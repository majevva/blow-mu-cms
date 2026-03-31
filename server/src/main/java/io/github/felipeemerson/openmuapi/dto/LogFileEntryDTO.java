package io.github.felipeemerson.openmuapi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LogFileEntryDTO {

    private String name;

    private String lastUpdatedAt;

    private long sizeBytes;

    private String sizeLabel;

    private String downloadPath;
}

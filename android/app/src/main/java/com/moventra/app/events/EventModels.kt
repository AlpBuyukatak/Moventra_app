package com.moventra.app.events

/**
 * Backend /events response tipleri
 *
 * Backend'te event include'larında:
 *  - hobby
 *  - createdBy { id, name, city }
 *  - participants [{ userId, eventId, ... }]
 * geliyor. Burada sadece ihtiyacımız olan alanları modelledik.
 */

// Event'i oluşturan kullanıcı (web /events include.createdBy)
data class CreatedByDto(
    val id: Int,
    val name: String?,
    val city: String?
)

// Katılımcı (liste boyutunu joined count için kullanıyoruz)
data class EventParticipantLite(
    val userId: Int,
    val eventId: Int
    // Backend ekstra alanlar gönderirse (id, user, createdAt ...)
    // Gson/Moshi bunları yok sayar, sorun olmaz.
)

data class EventDto(
    val id: Int,
    val title: String,
    val description: String?,
    val city: String,
    val location: String?,
    val dateTime: String,      // ISO string (ör: 2025-12-10T18:30:00.000Z veya local)
    val hobbyId: Int?,
    val capacity: Int?,

    // Opsiyonel ek alanlar (her endpoint'te gelmeyebilir, bu yüzden nullable)
    val participants: List<EventParticipantLite>? = null,
    val createdBy: CreatedByDto? = null
)

data class EventsResponse(
    val events: List<EventDto>
)

/**
 * Yeni event oluşturma request body
 * Backend'deki TS koduyla uyumlu:
 * title, description, city, location, dateTime, hobbyId, capacity
 */
data class CreateEventRequest(
    val title: String,
    val description: String?,
    val city: String,
    val location: String?,
    val dateTime: String,
    val hobbyId: Int,
    val capacity: Int?
)

data class CreateEventResponse(
    val event: EventDto
)

/**
 * Join / favorite gibi basit cevaplar için
 */
data class SimpleMessageResponse(
    val message: String?
)

/**
 * Join endpoint’i özelinde dönen body:
 * { participant: { userId, eventId } }
 */
data class JoinEventResponse(
    val participant: EventParticipantLite?
)

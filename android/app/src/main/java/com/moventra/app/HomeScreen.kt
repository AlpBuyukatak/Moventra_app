package com.moventra.app

import androidx.compose.animation.Crossfade
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.moventra.app.ui.theme.MovGreen1
import com.moventra.app.ui.theme.MovGreen2
import com.moventra.app.ui.theme.MovLightBgAlt
import com.moventra.app.ui.theme.MovTextDescription
import kotlinx.coroutines.delay

@Composable
fun HomeScreen(
    onBrowseEvents: () -> Unit,
    onSeeAllHobbies: () -> Unit
) {
    val scroll = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(scroll)
            .padding(horizontal = 20.dp, vertical = 24.dp),
        verticalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        HomeHeroSection(
            onBrowseEvents = onBrowseEvents,
            onSeeAllHobbies = onSeeAllHobbies
        )

        HomeNowPeopleCard()

        HomeHowMoventraWorksSection()

        HomeExploreByHobbySection(
            onSeeAllHobbies = onSeeAllHobbies
        )

        HomeBottomCtaSection(
            onBrowseEvents = onBrowseEvents,
            onSeeAllHobbies = onSeeAllHobbies
        )

        Spacer(modifier = Modifier.height(16.dp))
    }
}

/* ---------------------------------------------------------
 * HERO + WHY MOVENTRA SLIDER
 * -------------------------------------------------------- */

@Composable
private fun HomeHeroSection(
    onBrowseEvents: () -> Unit,
    onSeeAllHobbies: () -> Unit
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            text = "Welcome to Moventra",
            style = MaterialTheme.typography.labelMedium,
            color = MovTextDescription
        )

        Text(
            text = "Meet people\nthrough your hobbies.",
            style = MaterialTheme.typography.headlineLarge,
            lineHeight = MaterialTheme.typography.headlineLarge.lineHeight
        )

        Text(
            text = "Discover local and global events based on what you love: board games, sports, workshops, language exchange and more. Join small, friendly groups instead of crowded random meetups.",
            style = MaterialTheme.typography.bodyMedium,
            color = MovTextDescription
        )

        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Button(
                onClick = onBrowseEvents,
                modifier = Modifier.weight(1f)
            ) {
                Text("Browse events")
            }

            OutlinedButton(
                onClick = onSeeAllHobbies,
                modifier = Modifier.weight(1f)
            ) {
                Text("See all hobbies")
            }
        }

        Text(
            text = "No spam, no giant crowds. Just small, interest-based meetups.",
            style = MaterialTheme.typography.bodySmall,
            color = MovTextDescription
        )

        Spacer(modifier = Modifier.height(8.dp))

        HomeWhyMoventraSlider()
    }
}

@Composable
private fun HomeWhyMoventraSlider() {
    val pages = listOf(0, 1, 2)
    var currentPage by remember { mutableStateOf(0) }

    // 3 sn'de bir otomatik geçiş
    LaunchedEffect(Unit) {
        while (true) {
            delay(3000)
            currentPage = (currentPage + 1) % pages.size
        }
    }

    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                // sabit yükseklik → içerik değişince zıplama yok
                .height(280.dp),
            shape = MaterialTheme.shapes.extraLarge,
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface
            )
        ) {
            Crossfade(
                targetState = currentPage,
                modifier = Modifier.fillMaxSize(),
                label = "why-moventra-crossfade"
            ) { page ->
                when (page) {
                    0 -> WhySlideStats()
                    1 -> WhySlideSmallGroups()
                    else -> WhySlideHobbyFirst()
                }
            }
        }

        // Dotted indicator – tıklayınca sayfa değişsin
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            pages.forEach { index ->
                val selected = index == currentPage
                Box(
                    modifier = Modifier
                        .padding(horizontal = 4.dp)
                        .height(8.dp)
                        .width(if (selected) 18.dp else 8.dp)
                        .clip(RoundedCornerShape(100.dp))
                        .background(
                            if (selected) MovGreen1
                            else MovTextDescription.copy(alpha = 0.25f)
                        )
                        .clickable { currentPage = index }
                )
            }
        }
    }
}

@Composable
private fun WhySlideStats() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            text = "Why Moventra?",
            style = MaterialTheme.typography.titleLarge
        )
        Text(
            text = "Instead of scrolling through random events, Moventra focuses on hobbies first. You choose what you love, we show you where you can meet.",
            style = MaterialTheme.typography.bodySmall,
            color = MovTextDescription
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            StatPill("52+", "Cities tested", modifier = Modifier.weight(1f))
            StatPill("118+", "Hobby types", modifier = Modifier.weight(1f))
        }

        StatPill(
            "340",
            "Small group meetups",
            modifier = Modifier.fillMaxWidth()
        )

        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            TagPill("Great for newcomers")
            TagPill("Perfect for expats & students")
            TagPill("No big crowds")
        }
    }
}

@Composable
private fun WhySlideSmallGroups() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            text = "Small groups, real conversations",
            style = MaterialTheme.typography.titleLarge
        )
        Text(
            text = "Moventra focuses on friendly, small-group meetups where you can actually talk.",
            style = MaterialTheme.typography.bodySmall,
            color = MovTextDescription
        )
        Text(
            text = "• Hosts keep groups intentionally small and welcoming.\n" +
                    "• Clear event descriptions help you know what to expect.\n" +
                    "• Ideal if big, noisy meetups feel draining or awkward.",
            style = MaterialTheme.typography.bodySmall,
            color = MovTextDescription
        )

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(MaterialTheme.shapes.large)
                .background(MovLightBgAlt)
                .padding(12.dp)
        ) {
            Text(
                text = "Moventra is free to use – you only pay when an organizer charges for a specific event.",
                style = MaterialTheme.typography.bodySmall,
                color = MovTextDescription
            )
        }

        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            TagPill("small groups")
            TagPill("easy conversations")
        }
    }
}

@Composable
private fun WhySlideHobbyFirst() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            text = "Designed for hobby-first discovery",
            style = MaterialTheme.typography.titleLarge
        )
        Text(
            text = "Instead of endless feeds, Moventra helps you meet people through what you already enjoy.",
            style = MaterialTheme.typography.bodySmall,
            color = MovTextDescription
        )
        Text(
            text = "• Browse events by what you like, not by random categories.\n" +
                    "• Get ideas for new meetups from real hobby examples.\n" +
                    "• Filter by city so you only see events that are relevant to you.",
            style = MaterialTheme.typography.bodySmall,
            color = MovTextDescription
        )

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(20.dp))
                .background(MaterialTheme.colorScheme.surface.copy(alpha = 0.98f))
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            Text(
                text = "Start with a hobby you already love – or use Moventra to restart something you stopped doing.",
                style = MaterialTheme.typography.bodySmall,
                color = MovTextDescription
            )
        }

        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            TagPill("No algorithmic feeds")
            TagPill("No follower counts")
            TagPill("Real-life meetups first")
        }
    }
}

@Composable
private fun StatPill(
    bigText: String,
    smallText: String,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.95f)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp),
            verticalArrangement = Arrangement.spacedBy(2.dp)
        ) {
            Text(
                text = bigText,
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.background
            )
            Text(
                text = smallText,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.background.copy(alpha = 0.85f)
            )
        }
    }
}

@Composable
private fun TagPill(text: String) {
    Card(
        shape = RoundedCornerShape(999.dp),
        colors = CardDefaults.cardColors(
            containerColor = MovLightBgAlt
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
            style = MaterialTheme.typography.labelMedium,
            color = MovTextDescription
        )
    }
}

/* ---------------------------------------------------------
 * RIGHT NOW… – OTOMATİK HIGHLIGHT CARD
 * -------------------------------------------------------- */

data class NowHighlight(
    val title: String,
    val subtitle: String
)

@Composable
private fun HomeNowPeopleCard() {
    val highlights = listOf(
        NowHighlight(
            title = "Board games",
            subtitle = "Catan, Codenames, chess nights & more."
        ),
        NowHighlight(
            title = "Walk & talk",
            subtitle = "Casual city walks and coffee afterwards."
        ),
        NowHighlight(
            title = "Language exchange",
            subtitle = "Practice English, German, Turkish & more."
        )
    )

    var currentIndex by remember { mutableStateOf(0) }

    LaunchedEffect(Unit) {
        while (true) {
            delay(4000)
            currentIndex = (currentIndex + 1) % highlights.size
        }
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.extraLarge,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Crossfade(
            targetState = currentIndex,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            label = "now-highlight"
        ) { index ->
            val item = highlights[index]
            Column(
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = "Right now, people are mostly meeting for ${item.title}.",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = item.subtitle,
                    style = MaterialTheme.typography.bodySmall,
                    color = MovTextDescription
                )
            }
        }
    }
}

/* ---------------------------------------------------------
 * HOW MOVENTRA WORKS – HORIZONTAL CARD RAIL
 * -------------------------------------------------------- */

@Composable
private fun HomeHowMoventraWorksSection() {
    Column(
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            text = "How Moventra works",
            style = MaterialTheme.typography.titleLarge
        )
        Text(
            text = "Pick your city, choose a hobby, and join a small group. Moventra keeps things simple so you can focus on real conversations, not endless feeds.",
            style = MaterialTheme.typography.bodyMedium,
            color = MovTextDescription
        )

        val items = listOf(
            Triple(
                "1",
                "Choose your city",
                "Set your home base or travel destination. We’ll show events nearby first."
            ),
            Triple(
                "2",
                "Pick your hobbies",
                "From board games to hiking, language exchange or tech talks: choose what you actually enjoy."
            ),
            Triple(
                "3",
                "Join small groups",
                "Meet up in small, friendly groups where it’s easy to talk and actually remember people’s names."
            )
        )

        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(horizontal = 2.dp)
        ) {
            items(items) { (step, title, body) ->
                HowCard(
                    step = step,
                    title = title,
                    body = body
                )
            }
        }
    }
}

@Composable
private fun HowCard(
    step: String,
    title: String,
    body: String
) {
    Card(
        modifier = Modifier
            .width(260.dp)
            .clickable { /* ileride: detay sayfası */ },
        shape = MaterialTheme.shapes.extraLarge,
        colors = CardDefaults.cardColors(
            containerColor = MovLightBgAlt
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = step,
                style = MaterialTheme.typography.labelLarge,
                color = MovTextDescription
            )
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium
            )
            Text(
                text = body,
                style = MaterialTheme.typography.bodySmall,
                color = MovTextDescription
            )
        }
    }
}

/* ---------------------------------------------------------
 * EXPLORE BY HOBBY + BOTTOM CTA
 * -------------------------------------------------------- */

@Composable
private fun HomeExploreByHobbySection(
    onSeeAllHobbies: () -> Unit
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Explore by hobby",
                    style = MaterialTheme.typography.titleLarge
                )
                Text(
                    text = "Some of the most popular ways people use Moventra right now.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MovTextDescription
                )
            }
            TextButtonSmallLink(
                text = "View all hobbies →",
                onClick = onSeeAllHobbies
            )
        }

        Column(
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            HobbyMiniCard(
                title = "Board games",
                body = "Catan, Codenames, chess nights & more."
            )
            HobbyMiniCard(
                title = "Walk & talk",
                body = "Casual city walks and coffee afterwards."
            )
            HobbyMiniCard(
                title = "Language exchange",
                body = "Practice English, German, Turkish & more."
            )
            HobbyMiniCard(
                title = "Outdoor & sports",
                body = "Running clubs, hiking groups, cycling meetups."
            )
            HobbyMiniCard(
                title = "Tech & startup",
                body = "Side-project nights, coding meetups, study groups."
            )
            HobbyMiniCard(
                title = "Creative hobbies",
                body = "Drawing, photography and creative workshops."
            )
        }
    }
}

@Composable
private fun HobbyMiniCard(
    title: String,
    body: String
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.extraLarge,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleSmall
            )
            Text(
                text = body,
                style = MaterialTheme.typography.bodySmall,
                color = MovTextDescription
            )
        }
    }
}

@Composable
private fun HomeBottomCtaSection(
    onBrowseEvents: () -> Unit,
    onSeeAllHobbies: () -> Unit
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            text = "Built for real-world conversations",
            style = MaterialTheme.typography.titleLarge
        )
        Text(
            text = "Moventra is for people who want to actually meet – not just join another online group. Events are designed around small groups, clear descriptions and real interests.",
            style = MaterialTheme.typography.bodyMedium,
            color = MovTextDescription
        )
        Text(
            text = "• Hosts share clear event details, locations and group size.\n" +
                    "• You decide how often you join – no commitment, no pressure.\n" +
                    "• Great for moving to a new city or restarting old hobbies.",
            style = MaterialTheme.typography.bodySmall,
            color = MovTextDescription
        )

        Spacer(modifier = Modifier.height(8.dp))

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(MaterialTheme.shapes.extraLarge)
                .background(
                    Brush.linearGradient(
                        listOf(MovGreen1, MovGreen2)
                    )
                )
                .padding(18.dp)
        ) {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp),
                horizontalAlignment = Alignment.Start
            ) {
                Text(
                    text = "Ready to meet people through your hobbies?",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onPrimary
                )
                Text(
                    text = "Start by browsing events in your city or explore all hobbies to see what’s possible with Moventra.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.9f)
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Button(
                        onClick = onBrowseEvents,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Browse nearby events")
                    }
                    OutlinedButton(
                        onClick = onSeeAllHobbies,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Explore hobby ideas")
                    }
                }
            }
        }
    }
}

@Composable
private fun TextButtonSmallLink(
    text: String,
    onClick: () -> Unit
) {
    androidx.compose.material3.TextButton(onClick = onClick) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelMedium,
            textAlign = TextAlign.End
        )
    }
}

package app.lumen.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.unit.dp
import app.lumen.R

/** Four sections; the raised Add button takes the middle slot. */
private val SECTIONS = listOf(
    Triple(Screen.Home, R.drawable.ic_nav_home, R.string.nav_home),
    Triple(Screen.Projects, R.drawable.ic_nav_projects, R.string.nav_projects),
    Triple(Screen.Insights, R.drawable.ic_nav_chart, R.string.nav_insights),
    Triple(Screen.Settings, R.drawable.ic_nav_settings, R.string.nav_settings),
)

private val ADD_SIZE = 64.dp

/** How far the Add button stands above the bar. */
private val ADD_RISE = 20.dp

/** The bottom bar. It is on every screen, Add and the editors included. [selected] is null while Add is open. */
@Composable
internal fun BottomBar(selected: Screen?, onSelect: (Screen) -> Unit, onAdd: () -> Unit) {
    val p = palette
    val colors = NavigationBarItemDefaults.colors(
        selectedIconColor = p.accent,
        selectedTextColor = p.accent,
        indicatorColor = p.accent.copy(alpha = 0.16f),
        unselectedIconColor = p.muted,
        unselectedTextColor = p.muted,
    )
    Box(Modifier.fillMaxWidth()) {
        NavigationBar(Modifier.padding(top = ADD_RISE), containerColor = p.bg, windowInsets = WindowInsets(0, 0, 0, 0)) {
            SECTIONS.forEachIndexed { index, (target, icon, label) ->
                if (index == 2) {
                    // An empty slot keeps the other four items evenly spaced around the Add button.
                    NavigationBarItem(
                        selected = false,
                        onClick = {},
                        enabled = false,
                        icon = { Spacer(Modifier.size(24.dp)) },
                        modifier = Modifier.clearAndSetSemantics {},
                        colors = colors,
                    )
                }
                NavigationBarItem(
                    selected = selected == target,
                    onClick = { onSelect(target) },
                    icon = { Icon(painterResource(icon), null) },
                    label = { Text(stringResource(label)) },
                    colors = colors,
                )
            }
        }
        AddButton(onAdd, Modifier.align(Alignment.TopCenter))
    }
}

@Composable
private fun AddButton(onClick: () -> Unit, modifier: Modifier = Modifier) {
    val p = palette
    val label = stringResource(R.string.nav_add)
    Box(
        modifier
            .size(ADD_SIZE)
            .shadow(10.dp, CircleShape, ambientColor = p.accent, spotColor = p.accent)
            .clip(CircleShape)
            .background(Brush.linearGradient(listOf(p.accentFrom, p.accentTo)))
            .clickable(onClickLabel = label, role = Role.Button, onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Icon(painterResource(R.drawable.ic_nav_add), label, tint = p.onAccent, modifier = Modifier.size(32.dp))
    }
}

package app.lumen

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import app.lumen.ui.LumenApp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // System bar style follows the app theme; LumenApp sets it with enableEdgeToEdge.
        setContent { LumenApp() }
    }
}

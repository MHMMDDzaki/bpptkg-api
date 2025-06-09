// d:\Dev\bpptkg-api\src\socket.ts
import { Server, Socket } from "socket.io";
import mongoose, { Types } from "mongoose";
import { getLatestRsamData as fetchLatestRsamDataFromService } from "./services/rsamv2.service";
import { IRsamData } from "./interfaces/rsamv2.interface";
// import RsamConfig from './models/rsamConfig.model';
import { IRsamConfig } from "./interfaces/rsamConfig.interface";
import RsamConfig from "./models/rsamConfig.model";
import {
  ChangeStreamDocument,
} from "mongodb";

let latestRsamV2Data: IRsamData | null = null;
// Kurangi interval polling untuk development agar lebih cepat terlihat perubahannya,
// sesuaikan untuk produksi (misalnya, setiap 30 detik atau 1 menit)
const RSAM_V2_POLL_INTERVAL = 1000; // Poll setiap 5 detik

// Fungsi untuk menginisialisasi Change Stream setelah koneksi MongoDB siap
function initializeRsamConfigChangeStream(io: Server) {
  try {
    const rsamConfigCollection =
      mongoose.connection.collection<IRsamConfig>("rsam_config"); // Beri tipe pada collection
    const changeStream = rsamConfigCollection.watch<IRsamConfig>( // Beri tipe pada watch
      [
        {
          $match: {
            operationType: { $in: ["insert", "update", "replace", "delete"] },
          },
        },
        {
          $project: {
            fullDocument: 1,
            documentKey: 1,
            operationType: 1,
            updateDescription: 1,
          },
        },
      ]
      // { fullDocument: 'updateLookup' } // Opsional
    );

    changeStream.on(
      "change",
      async (change: ChangeStreamDocument<IRsamConfig>) => {
        // Tipe change
        console.log(
          "MongoDB Change Stream event for rsam_config:",
          change.operationType,
          (change as any).documentKey?._id
        ); // Cast ke any untuk akses cepat, atau lihat di bawah

        let docId: string | undefined;

        // Cara lebih aman untuk mengakses documentKey dan fullDocument
        if ("documentKey" in change && change.documentKey?._id) {
          docId = (change.documentKey._id as Types.ObjectId).toString();
        }

        if (!docId) {
          console.warn(
            "Change event without documentKey._id, skipping:",
            change
          );
          return;
        }
        const roomId = `config_update_${docId}`;

        if (
          change.operationType === "insert" ||
          change.operationType === "update" ||
          change.operationType === "replace"
        ) {
          let updatedDocument: IRsamConfig | null | undefined = null;

          if ("fullDocument" in change) {
            updatedDocument = change.fullDocument;
          }

          // Jika fullDocument tidak ada (misalnya pada update parsial tanpa lookup), coba fetch manual
          if (
            !updatedDocument &&
            (change.operationType === "update" ||
              change.operationType === "replace")
          ) {
            console.warn(
              `Full document not in change event for ${docId}, fetching manually.`
            );
            updatedDocument = await RsamConfig.findById(docId);
          }

          if (updatedDocument) {
            console.log(
              `Emitting 'rsam_config_updated' to room ${roomId}:`,
              updatedDocument._id
            );
            io.to(roomId).emit(
              "rsam_config_updated",
              updatedDocument.toObject()
            ); // .toObject() untuk plain JS object
          } else {
            console.warn(
              `Document ${docId} not found after change event or fullDocument missing.`
            );
          }
        } else if (change.operationType === "delete") {
          console.log(
            `Emitting 'rsam_config_deleted' to room ${roomId}: ID ${docId}`
          );
          io.to(roomId).emit("rsam_config_deleted", { id: docId });
        }
      }
    );

    changeStream.on("error", (error) => {
      console.error("MongoDB Change Stream error for rsam_config:", error);
      // Pertimbangkan untuk mencoba menghubungkan kembali stream di sini
    });

    console.log("MongoDB Change Stream for rsam_config is active.");
  } catch (error) {
    console.error(
      "Failed to start MongoDB Change Stream for rsam_config:",
      error
    );
  }
}

export function configureSockets(io: Server) {
  console.log("Configuring Socket.IO event handlers...");

  // --- Logika untuk /api/rsamv2-latest ---
  const fetchAndBroadcastRsamV2Latest = async () => {
    try {
      const newData = await fetchLatestRsamDataFromService();
      // Perbandingan sederhana, bisa lebih canggih jika perlu
      if (JSON.stringify(newData) !== JSON.stringify(latestRsamV2Data)) {
        latestRsamV2Data = newData;
        console.log(
          "Broadcasting rsamv2_latest_update:",
          latestRsamV2Data.Timestamp,
          latestRsamV2Data.RSAM
        );
        io.emit("rsamv2_latest_update", latestRsamV2Data);
      }
    } catch (error: any) {
      console.error(
        "Error fetching/broadcasting latest RSAM v2 data:",
        error.message
      );
    }
  };

  // Polling untuk data rsamv2-latest
  setInterval(fetchAndBroadcastRsamV2Latest, RSAM_V2_POLL_INTERVAL);
  // Ambil data awal sekali saat startup
  fetchAndBroadcastRsamV2Latest();

  // --- Logika untuk /api/rsam-config/:id (MongoDB Change Streams) ---
  if (mongoose.connection.readyState === 1) {
    // 1 berarti 'connected'
    initializeRsamConfigChangeStream(io);
  } else {
    mongoose.connection.once("open", () => {
      console.log(
        "MongoDB connected, initializing Change Stream for rsam_config."
      );
      initializeRsamConfigChangeStream(io);
    });
  }

  // --- Menangani koneksi klien ---
  io.on("connection", (socket: Socket) => {
    console.log("Klien terhubung via WebSocket:", socket.id);

    // Mengirim data rsamv2-latest saat ini ke klien yang baru terhubung
    if (latestRsamV2Data) {
      // socket.emit("rsamv2_latest_update", latestRsamV2Data);
      setTimeout(() => {
        console.log("TEST: Broadcasting to all after small delay for new connection");
        io.emit("rsamv2_latest_update_test_delay", latestRsamV2Data);
    }, 500); 
    }

    // Klien subscribe ke pembaruan config tertentu
    socket.on("subscribe_to_config", async (data: { id: string }) => {
      if (data && data.id && mongoose.Types.ObjectId.isValid(data.id)) {
        const roomId = `config_update_${data.id}`;
        socket.join(roomId);
        console.log(`Klien ${socket.id} subscribe ke room ${roomId}`);
        // Opsional: Kirim status config saat ini setelah subscribe
        try {
          const config = await RsamConfig.findById(data.id);
          if (config) {
            socket.emit("rsam_config_updated", config);
          }
        } catch (error) {
          console.error(
            `Error fetching config ${data.id} for subscription:`,
            error
          );
        }
      } else {
        socket.emit("config_subscription_error", {
          message: "Invalid ID for config subscription.",
        });
        console.warn(
          `Klien ${socket.id} mengirim request subscribe_to_config yang tidak valid:`,
          data
        );
      }
    });

    // Klien unsubscribe dari pembaruan config
    socket.on("unsubscribe_from_config", (data: { id: string }) => {
      if (data && data.id) {
        const roomId = `config_update_${data.id}`;
        socket.leave(roomId);
        console.log(`Klien ${socket.id} unsubscribe dari room ${roomId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log("Klien terputus:", socket.id);
      // Socket.IO secara otomatis menghapus socket dari semua room saat disconnect
    });

    socket.on("error", (error) => {
      console.error(`Socket error untuk klien ${socket.id}:`, error);
    });
  });
}

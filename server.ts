import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { fileURLToPath } from "url";


dotenv.config();

const db = new Database("database.db");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    first_name TEXT,
    last_name TEXT,
    role TEXT, -- 'buyer', 'seller', 'admin'
    id_number TEXT,
    is_verified INTEGER DEFAULT 0,
    is_blocked INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id INTEGER,
    title TEXT,
    description TEXT,
    category TEXT,
    quality TEXT,
    quality_notes TEXT,
    price_type TEXT, -- 'fixed', 'bidding'
    price REAL,
    quantity TEXT,
    latitude REAL,
    longitude REAL,
    status TEXT DEFAULT 'active', -- 'active', 'pending', 'sold', 'deactivated'
    is_verified INTEGER DEFAULT 0,
    verification_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(seller_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS listing_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER,
    image_url TEXT,
    FOREIGN KEY(listing_id) REFERENCES listings(id)
  );

  CREATE TABLE IF NOT EXISTS bids (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER,
    buyer_id INTEGER,
    amount REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(listing_id) REFERENCES listings(id),
    FOREIGN KEY(buyer_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    message TEXT,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS kyc_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    document_url TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reporter_id INTEGER,
    target_type TEXT, -- 'listing', 'user'
    target_id INTEGER,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(reporter_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS saved_listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    listing_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, listing_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(listing_id) REFERENCES listings(id)
  );
`);

// Seed Database with realistic data if empty
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;

// Ensure at least one admin exists for testing
const adminExists = db.prepare("SELECT id FROM users WHERE role = 'admin'").get();
if (!adminExists) {
  const adminStmt = db.prepare("INSERT INTO users (email, password, first_name, last_name, role, is_verified) VALUES (?, ?, ?, ?, ?, ?)");
  adminStmt.run("admin@example.com", "admin123", "Admin", "User", "admin", 1);
}

if (userCount.count === 0) {
  // Create a demo seller
  const sellerStmt = db.prepare("INSERT INTO users (email, password, first_name, last_name, role, is_verified) VALUES (?, ?, ?, ?, ?, ?)");
  sellerStmt.run("seller@example.com", "password", "John", "Doe", "seller", 1);
  const sellerId = 1;

  const listings = [
    {
      title: "500kg Clean PET Flakes",
      description: "High-quality PET flakes, sorted and washed. Ready for industrial processing. Minimal contamination.",
      category: "Plastic",
      quality: "Sorted/Clean",
      price: 450,
      quantity: "500kg",
      images: ["https://loremflickr.com/800/600/plastic,recycling", "https://loremflickr.com/800/600/bottles,plastic"]
    },
    {
      title: "Mixed Aluminum Scrap",
      description: "Industrial aluminum scrap from manufacturing offcuts. Mostly 6061 and 7075 alloys.",
      category: "Metal",
      quality: "Industrial Grade",
      price: 1200,
      quantity: "1 Ton",
      images: ["https://loremflickr.com/800/600/metal,scrap"]
    },
    {
      title: "Bulk Cardboard Bales",
      description: "OCC (Old Corrugated Containers) bales. Dry and tightly packed. 20 bales available.",
      category: "Paper",
      quality: "Sorted/Clean",
      price: 150,
      quantity: "5 Tons",
      images: ["https://loremflickr.com/800/600/paper,cardboard"]
    },
    {
      title: "E-Waste: Mixed Circuit Boards",
      description: "Assorted circuit boards from consumer electronics. Untested, sold for precious metal recovery.",
      category: "Electronic",
      quality: "Raw/Contaminated",
      price: 800,
      quantity: "100kg",
      images: ["https://loremflickr.com/800/600/electronics,circuit"]
    },
    {
      title: "Crushed Clear Glass Cullet",
      description: "Clear glass cullet, crushed to 10-20mm size. Free from ceramics and organics.",
      category: "Glass",
      quality: "Sorted/Clean",
      price: 300,
      quantity: "2 Tons",
      images: ["https://loremflickr.com/800/600/glass,bottles"]
    },
    {
      title: "Organic Compost Material",
      description: "Pre-processed organic waste suitable for large-scale composting facilities.",
      category: "Organic",
      quality: "Unsorted/Mixed",
      price: 50,
      quantity: "10 Tons",
      images: ["https://loremflickr.com/800/600/compost,soil"]
    },
    {
      title: "Cotton Textile Scraps",
      description: "100% cotton textile scraps from garment factory. Sorted by color (mostly white).",
      category: "Textile",
      quality: "Industrial Grade",
      price: 200,
      quantity: "250kg",
      images: ["https://loremflickr.com/800/600/fabric,textile"]
    }
  ];

  const listingStmt = db.prepare(`
    INSERT INTO listings (seller_id, title, description, category, quality, price_type, price, quantity, latitude, longitude, is_verified, verification_notes)
    VALUES (?, ?, ?, ?, ?, 'fixed', ?, ?, 0, 0, 1, 'AI Verified: Material matches description and category.')
  `);
  const imgStmt = db.prepare("INSERT INTO listing_images (listing_id, image_url) VALUES (?, ?)");

  listings.forEach(l => {
    const info = listingStmt.run(sellerId, l.title, l.description, l.category, l.quality, l.price, l.quantity);
    const listingId = info.lastInsertRowid;
    l.images.forEach(img => imgStmt.run(listingId, img));
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // --- Auth Routes ---
  app.post("/api/auth/register", (req, res) => {
    const { email, password, firstName, lastName, role, idNumber } = req.body;
    if (role === 'admin') {
      return res.status(403).json({ error: "Admin accounts cannot be created publicly" });
    }
    try {
      const stmt = db.prepare("INSERT INTO users (email, password, first_name, last_name, role, id_number) VALUES (?, ?, ?, ?, ?, ?)");
      const info = stmt.run(email, password, firstName, lastName, role, idNumber);
      res.json({ id: info.lastInsertRowid, email, role, firstName, isVerified: 0 });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password) as any;
    if (user) {
      if (user.is_blocked) return res.status(403).json({ error: "Account blocked" });
      res.json({ id: user.id, email: user.email, role: user.role, firstName: user.first_name, isVerified: user.is_verified });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // --- Listing Routes ---
  app.get("/api/listings", (req, res) => {
    const { category, quality, minPrice, maxPrice, search, sort, sellerId } = req.query;
    let query = "SELECT l.*, u.first_name as seller_name, u.is_verified as seller_verified FROM listings l JOIN users u ON l.seller_id = u.id WHERE 1=1";
    const params: any[] = [];

    if (!sellerId) {
      query += " AND l.status = 'active'";
    } else {
      query += " AND l.seller_id = ?";
      params.push(Number(sellerId));
    }

    if (category) {
      query += " AND l.category = ?";
      params.push(category);
    }
    if (quality) {
      query += " AND l.quality = ?";
      params.push(quality);
    }
    if (minPrice) {
      query += " AND l.price >= ?";
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      query += " AND l.price <= ?";
      params.push(Number(maxPrice));
    }
    if (search) {
      query += " AND (l.title LIKE ? OR l.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (sort === 'price_low') query += " ORDER BY l.price ASC";
    else if (sort === 'price_high') query += " ORDER BY l.price DESC";
    else query += " ORDER BY l.created_at DESC";

    const listings = db.prepare(query).all(...params) as any[];
    
    // Attach images
    listings.forEach(l => {
      l.images = db.prepare("SELECT image_url FROM listing_images WHERE listing_id = ?").all(l.id).map((img: any) => img.image_url);
    });

    res.json(listings);
  });

  app.get("/api/listings/:id", (req, res) => {
    const listing = db.prepare("SELECT l.*, u.first_name as seller_name, u.is_verified as seller_verified FROM listings l JOIN users u ON l.seller_id = u.id WHERE l.id = ?").get(req.params.id) as any;
    if (listing) {
      listing.images = db.prepare("SELECT image_url FROM listing_images WHERE listing_id = ?").all(listing.id).map((img: any) => img.image_url);
      res.json(listing);
    } else {
      res.status(404).json({ error: "Listing not found" });
    }
  });

  app.patch("/api/listings/:id/status", (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    try {
      db.transaction(() => {
        db.prepare("UPDATE listings SET status = ? WHERE id = ?").run(status, id);

        if (status === 'sold') {
          const listing = db.prepare("SELECT * FROM listings WHERE id = ?").get(id) as any;
          if (listing.price_type === 'bidding') {
            const highestBid = db.prepare("SELECT * FROM bids WHERE listing_id = ? ORDER BY amount DESC LIMIT 1").get(id) as any;
            if (highestBid) {
              const message = `Congratulations! You won the bid for "${listing.title}" with a bid of ₦${highestBid.amount}.`;
              db.prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)").run(highestBid.buyer_id, message);
            }
          }
        }
      })();
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post("/api/listings", async (req, res) => {
    const { sellerId, title, description, category, quality, qualityNotes, priceType, price, quantity, latitude, longitude, images } = req.body;
    const stmt = db.prepare(`
      INSERT INTO listings (seller_id, title, description, category, quality, quality_notes, price_type, price, quantity, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(sellerId, title, description, category, quality, qualityNotes, priceType, price, quantity, latitude, longitude);
    const listingId = info.lastInsertRowid;

    if (images && Array.isArray(images)) {
      const imgStmt = db.prepare("INSERT INTO listing_images (listing_id, image_url) VALUES (?, ?)");
      images.forEach(url => imgStmt.run(listingId, url));
    }

    // Trigger AI Audit (Non-blocking or immediate)
    if (process.env.GEMINI_API_KEY && images && images[0]) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const auditResponse = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            {
              parts: [
                { text: `Act as a marketplace auditor. Analyze this waste material listing:
                  Title: ${title}
                  Description: ${description}
                  Category: ${category}
                  Quality: ${quality}
                  
                  Check for:
                  1. Accuracy: Does description and image match the category?
                  2. Compliance: Is it prohibited (hazardous, illegal, or non-waste)?
                  3. Quality: Is the description and image quality sufficient for a buyer?
                  
                  Return the result in JSON format.` 
                },
                { inlineData: { mimeType: "image/jpeg", data: images[0].split(',')[1] } }
              ]
            }
          ],
          config: { 
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                is_verified: {
                  type: "BOOLEAN",
                  description: "Whether the listing is verified as accurate and compliant."
                },
                notes: {
                  type: "STRING",
                  description: "Audit notes explaining the verification status."
                },
                confidence: {
                  type: "NUMBER",
                  description: "Confidence score between 0 and 1."
                }
              },
              required: ["is_verified", "notes", "confidence"]
            }
          }
        });

        const result = JSON.parse(auditResponse.text || "{}");
        if (result.is_verified && result.confidence > 0.7) {
          db.prepare("UPDATE listings SET is_verified = 1, verification_notes = ? WHERE id = ?").run(result.notes, listingId);
        } else {
          db.prepare("UPDATE listings SET verification_notes = ? WHERE id = ?").run(result.notes, listingId);
        }
      } catch (e) {
        console.error("AI Audit failed", e);
      }
    }

    res.json({ id: listingId });
  });

  // --- AI Suggestion ---
  app.post("/api/ai/suggest-category", async (req, res) => {
    const { imageData } = req.body; // base64
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "AI Key missing" });

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { text: "Analyze this image of waste material and suggest the most appropriate primary category from the provided list. Return the result in JSON format." },
              { inlineData: { mimeType: "image/jpeg", data: imageData.split(',')[1] } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              category: {
                type: "STRING",
                enum: ["Plastic", "Metal", "Paper", "Organic", "Electronic", "Glass", "Textile", "Other"],
                description: "The suggested category for the waste material."
              },
              confidence: {
                type: "NUMBER",
                description: "Confidence score between 0 and 1."
              },
              reasoning: {
                type: "STRING",
                description: "Brief explanation for the choice."
              }
            },
            required: ["category"]
          }
        }
      });
      
      const result = JSON.parse(response.text || "{}");
      res.json({ category: result.category || "Other", confidence: result.confidence, reasoning: result.reasoning });
    } catch (e: any) {
      console.error("AI Suggestion error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // --- Admin Routes ---
  app.get("/api/admin/users", (req, res) => {
    const users = db.prepare("SELECT * FROM users").all();
    res.json(users);
  });

  app.post("/api/admin/users/:id/block", (req, res) => {
    const { blocked } = req.body;
    db.prepare("UPDATE users SET is_blocked = ? WHERE id = ?").run(blocked ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/admin/kyc", (req, res) => {
    const queue = db.prepare(`
      SELECT k.*, u.email, u.first_name, u.last_name 
      FROM kyc_documents k 
      JOIN users u ON k.user_id = u.id 
      WHERE k.status = 'pending'
    `).all();
    res.json(queue);
  });

  app.post("/api/admin/kyc/:id/approve", (req, res) => {
    const kyc = db.prepare("SELECT * FROM kyc_documents WHERE id = ?").get(req.params.id) as any;
    db.prepare("UPDATE kyc_documents SET status = 'approved' WHERE id = ?").run(req.params.id);
    db.prepare("UPDATE users SET is_verified = 1 WHERE id = ?").run(kyc.user_id);
    res.json({ success: true });
  });

  app.post("/api/admin/kyc/:id/reject", (req, res) => {
    db.prepare("UPDATE kyc_documents SET status = 'rejected' WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/kyc/upload", (req, res) => {
    const { userId, documentUrl } = req.body;
    db.prepare("INSERT INTO kyc_documents (user_id, document_url) VALUES (?, ?)").run(userId, documentUrl);
    res.json({ success: true });
  });

  // --- Notifications ---
  app.get("/api/notifications/:userId", (req, res) => {
    const notifications = db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC").all(req.params.userId);
    res.json(notifications);
  });

  app.patch("/api/notifications/:id/read", (req, res) => {
    db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // --- Bids ---
  app.get("/api/listings/:id/bids", (req, res) => {
    const bids = db.prepare(`
      SELECT b.*, u.first_name as buyer_name 
      FROM bids b 
      JOIN users u ON b.buyer_id = u.id 
      WHERE b.listing_id = ? 
      ORDER BY b.amount DESC
    `).all(req.params.id);
    res.json(bids);
  });

  app.post("/api/bids", (req, res) => {
    const { listingId, buyerId, amount } = req.body;
    
    // Get listing to find seller
    const listing = db.prepare("SELECT * FROM listings WHERE id = ?").get(listingId) as any;
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    try {
      db.transaction(() => {
        // Get current highest bid before inserting new one
        const previousHighestBid = db.prepare("SELECT * FROM bids WHERE listing_id = ? ORDER BY amount DESC LIMIT 1").get(listingId) as any;

        // Insert bid
        db.prepare("INSERT INTO bids (listing_id, buyer_id, amount) VALUES (?, ?, ?)").run(listingId, buyerId, amount);
        
        // Create notification for seller
        const buyer = db.prepare("SELECT first_name FROM users WHERE id = ?").get(buyerId) as any;
        const message = `New bid of ₦${amount} placed on your listing "${listing.title}" by ${buyer.first_name}.`;
        db.prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)").run(listing.seller_id, message);

        // Notify previous highest bidder if they are not the same person
        if (previousHighestBid && previousHighestBid.buyer_id !== buyerId) {
          const outbidMessage = `You have been outbid on "${listing.title}". The new highest bid is ₦${amount}.`;
          db.prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)").run(previousHighestBid.buyer_id, outbidMessage);
        }
      })();
      
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // --- Saved Listings ---
  app.get("/api/saved-listings/:userId", (req, res) => {
    const saved = db.prepare(`
      SELECT l.*, u.first_name as seller_name, u.is_verified as seller_verified 
      FROM saved_listings sl
      JOIN listings l ON sl.listing_id = l.id
      JOIN users u ON l.seller_id = u.id
      WHERE sl.user_id = ?
    `).all(req.params.userId) as any[];
    
    saved.forEach(l => {
      l.images = db.prepare("SELECT image_url FROM listing_images WHERE listing_id = ?").all(l.id).map((img: any) => img.image_url);
    });
    
    res.json(saved);
  });

  app.post("/api/saved-listings", (req, res) => {
    const { userId, listingId } = req.body;
    try {
      db.prepare("INSERT INTO saved_listings (user_id, listing_id) VALUES (?, ?)").run(userId, listingId);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Already saved or invalid data" });
    }
  });

  app.delete("/api/saved-listings/:userId/:listingId", (req, res) => {
    db.prepare("DELETE FROM saved_listings WHERE user_id = ? AND listing_id = ?").run(req.params.userId, req.params.listingId);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

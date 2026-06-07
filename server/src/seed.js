import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import Book from "./models/Book.js";
import Loan from "./models/Loan.js";
import Reservation from "./models/Reservation.js";
import User from "./models/User.js";
import { calculateFine } from "./utils/fineUtils.js";

dotenv.config();

const password = "Password123!";

const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const seed = async () => {
  await connectDB();

  await Promise.all([Loan.deleteMany(), Reservation.deleteMany(), Book.deleteMany(), User.deleteMany()]);

  const passwordHash = await bcrypt.hash(password, await bcrypt.genSalt(10));

  const [admin, librarian, member, secondMember] = await User.create([
    {
      email: "admin@library.test",
      name: "Mara Ellison",
      passwordHash,
      role: "admin"
    },
    {
      email: "librarian@library.test",
      name: "Theo Marlowe",
      passwordHash,
      role: "librarian"
    },
    {
      email: "member@library.test",
      membershipCode: "LIB-DEMO-001",
      name: "Nina Vale",
      passwordHash,
      phone: "555-0142",
      role: "member"
    },
    {
      email: "ava@library.test",
      membershipCode: "LIB-DEMO-002",
      name: "Ava Stone",
      passwordHash,
      phone: "555-0199",
      role: "member"
    }
  ]);

  const [designBook, overdueBook, unavailableBook, archiveBook] = await Book.create([
    {
      author: "Ellen Lupton",
      availableCopies: 2,
      categories: ["Design", "Reference"],
      description: "A sharp reference for visual hierarchy and editorial systems.",
      isbn: "978-1616893323",
      publishedYear: 2014,
      shelfLocation: "A1-03",
      title: "Thinking with Type",
      totalCopies: 3
    },
    {
      author: "Don Norman",
      availableCopies: 1,
      categories: ["Design", "Psychology"],
      description: "Human-centered design principles for everyday things.",
      isbn: "978-0465050659",
      publishedYear: 2013,
      shelfLocation: "B2-11",
      title: "The Design of Everyday Things",
      totalCopies: 2
    },
    {
      author: "Ursula K. Le Guin",
      availableCopies: 0,
      categories: ["Fiction", "Speculative"],
      description: "A compact classic that gives the reservation queue something to do.",
      isbn: "978-0441478125",
      publishedYear: 1969,
      shelfLocation: "F4-08",
      title: "The Left Hand of Darkness",
      totalCopies: 1
    },
    {
      author: "James Clear",
      availableCopies: 4,
      categories: ["Productivity"],
      description: "A widely borrowed title for testing catalog browsing.",
      isbn: "978-0735211292",
      publishedYear: 2018,
      shelfLocation: "C3-22",
      title: "Atomic Habits",
      totalCopies: 4
    }
  ]);

  await Loan.create([
    {
      book: designBook._id,
      dueAt: daysFromNow(10),
      issuedBy: librarian._id,
      member: member._id,
      status: "active"
    },
    {
      book: overdueBook._id,
      dueAt: daysFromNow(-5),
      issuedBy: librarian._id,
      member: member._id,
      status: "active"
    },
    {
      book: unavailableBook._id,
      dueAt: daysFromNow(12),
      issuedBy: librarian._id,
      member: member._id,
      status: "active"
    },
    {
      book: designBook._id,
      dueAt: daysFromNow(-6),
      fineAtReturn: calculateFine(daysFromNow(-6), daysFromNow(-2)),
      issuedBy: librarian._id,
      member: secondMember._id,
      returnedAt: daysFromNow(-2),
      returnedBy: librarian._id,
      status: "returned"
    }
  ]);

  await Reservation.create({
    book: unavailableBook._id,
    member: secondMember._id,
    status: "pending"
  });

  console.log("Seed complete.");
  console.log(`Admin: ${admin.email}`);
  console.log(`Librarian: ${librarian.email}`);
  console.log(`Member: ${member.email}`);
  console.log(`Password for all demo accounts: ${password}`);
  console.log(`Extra seeded book: ${archiveBook.title}`);
};

seed()
  .catch((error) => {
    console.error("Seed failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });

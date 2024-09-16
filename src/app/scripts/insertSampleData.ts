const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function main() {
    // Create 10 users
    const users = await Promise.all(
        Array.from({ length: 10 }).map(() => {
            return prisma.user.create({
                data: {
                    name: faker.person.fullName(),
                    email: faker.internet.email(),
                    emailVerified: faker.date.past(),
                    image: Math.random() > 0.5 ? faker.image.avatar() : null,
                    role: faker.helpers.arrayElement(['user', 'admin', 'organizer']),
                    priceID: faker.string.uuid(),
                    customerID: faker.string.uuid(),
                    connectedAccountId: faker.string.uuid(),
                    stripeConnectedLinked: faker.datatype.boolean(),
                    createdAt: faker.date.past(),
                    updatedAt: faker.date.recent(),
                },
            });
        })
    );

    // Ensure the specific user with email "chatforgon@gmail.com" exists or create it
    let organizer = await prisma.user.findUnique({
        where: { email: "chatforgon@gmail.com" },
    });

    if (!organizer) {
        organizer = await prisma.user.create({
            data: {
                name: "Chat For Gon",
                email: "chatforgon@gmail.com",
                emailVerified: faker.date.past(),
                image: faker.image.avatar(),
                role: "organizer",
                priceID: faker.string.uuid(),
                customerID: faker.string.uuid(),
                connectedAccountId: faker.string.uuid(),
                stripeConnectedLinked: faker.datatype.boolean(),
                createdAt: faker.date.past(),
                updatedAt: faker.date.recent(),
            },
        });
    }

    // Create 10 events, all associated with the "chatforgon@gmail.com" user
    const events = await Promise.all(
        Array.from({ length: 10 }).map(() => {
            const startDate = faker.date.future();
            const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // 3 hours later
            return prisma.event.create({
                data: {
                    eventName: faker.company.catchPhrase(),
                    userEmail: organizer.email,
                    ticketAmount: faker.number.int({ min: 50, max: 500 }),
                    ticketPrice: faker.number.int({ min: 10, max: 200 }),
                    location: faker.location.city(),
                    startDate,
                    endDate,
                    description: faker.lorem.paragraph(),
                    imageUrl: faker.image.url(),
                },
            });
        })
    );

    // Create tickets, attendances, and sales for each event (limit under 20)
    for (const event of events) {
        // Set ticket count to a maximum of 50
        const ticketCount = Math.min(faker.number.int({ min: 10, max: event.ticketAmount }), 20);

        for (let i = 0; i < ticketCount; i++) {
            const user = faker.helpers.arrayElement(users);

            // Create ticket
            await prisma.ticket.create({
                data: {
                    eventId: event.id,
                    eventName: event.eventName,
                    userEmail: user.email,
                    qrCodeUrl: faker.image.dataUri(),
                },
            });

            // Create attendance (not all ticket holders attend, but limit under 50)
            if (Math.random() > 0.2) {
                await prisma.attendance.create({
                    data: {
                        eventId: event.id,
                        eventName: event.eventName,
                        userEmail: user.email,
                        userName: user.name,
                        status: faker.helpers.arrayElement(['present', 'absent']),
                    },
                });
            }

            // Create sale (limit under 50)
            await prisma.sale.create({
                data: {
                    eventId: event.id,
                    price: event.ticketPrice,
                    userEmail: user.email,
                    userName: user.name,
                },
            });
        }
    }

    console.log('Sample data inserted successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

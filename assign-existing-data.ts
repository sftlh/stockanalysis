import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function assignExistingDataToUsers() {
  try {
    console.log('🔍 Checking for existing stock data without user assignment...')

    // Find all stock data that doesn't have a userId
    const unassignedData = await prisma.stockData.findMany({
      where: {
        userId: null
      }
    })

    if (unassignedData.length === 0) {
      console.log('✅ No unassigned stock data found.')
      return
    }

    console.log(`📊 Found ${unassignedData.length} unassigned stock records`)

    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true }
    })

    if (users.length === 0) {
      console.log('❌ No users found in the database. Please create a user first.')
      return
    }

    console.log(`👥 Found ${users.length} users:`)
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name || user.email} (ID: ${user.id})`)
    })

    // If there's only one user, assign all data to them
    if (users.length === 1) {
      const user = users[0]
      console.log(`\n🔄 Assigning all ${unassignedData.length} records to user: ${user.name || user.email}`)

      const result = await prisma.stockData.updateMany({
        where: {
          userId: null
        },
        data: {
          userId: user.id
        }
      })

      console.log(`✅ Successfully assigned ${result.count} records to user ${user.name || user.email}`)
      return
    }

    // If there are multiple users, ask which user should get the data
    console.log('\n⚠️  Multiple users found. Please specify which user should own the existing data.')
    console.log('You can modify this script to assign data to specific users based on your needs.')
    console.log('\nExample: To assign all data to the first user, uncomment the following code:')

    // Uncomment and modify the following lines if you want to assign to a specific user
    /*
    const targetUserId = users[0].id // Change this to the desired user ID
    const result = await prisma.stockData.updateMany({
      where: {
        userId: null
      },
      data: {
        userId: targetUserId
      }
    })
    console.log(`✅ Assigned ${result.count} records to user ID ${targetUserId}`)
    */

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
assignExistingDataToUsers()
  .then(() => {
    console.log('\n🎉 Script completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
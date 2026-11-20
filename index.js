const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType
} = require('discord.js');

require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const command = new SlashCommandBuilder()
  .setName('setup')
  .setDescription('Setup ROB RUN COMMUNITY')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

const rolesList = [
  { name: 'Founder', color: 0xFFD700 },
  { name: 'Administrator', color: 0xFF4500 },
  { name: 'Head Moderator', color: 0x3498DB },
  { name: 'Moderator', color: 0x2ECC71 },
  { name: 'Trial Moderator', color: 0x95A5A6 },
  { name: 'Clan Leader', color: 0x9B59B6 },
  { name: 'Pro Player', color: 0x00BCD4 },
  { name: 'OG', color: 0xE67E22 },
  { name: 'VIP', color: 0xF1C40F },
  { name: 'Member', color: 0x5865F2 }
];

const categories = {
  '01・START HERE': [
    'rules',
    'announcements',
    'welcome',
    'roles',
    'server-info'
  ],
  '02・COMMUNITY': [
    'general-chat',
    'memes',
    'screenshots',
    'clips',
    'find-players',
    'looking-for-team'
  ],
  '03・GAME': [
    'game-news',
    'tips-and-tricks',
    'achievements',
    'game-discussion',
    'clans',
    'game-events'
  ],
  '04・CLANS': [
    'clan-list',
    'recruitment',
    'clan-wars',
    'clan-leaders'
  ],
  '06・EVENTS': [
    'events',
    'giveaways',
    'tournaments',
    'event-results'
  ],
  '07・STAFF': [
    'staff-chat',
    'staff-logs',
    'reports'
  ]
};

async function getRole(guild, name, color) {
  let role = guild.roles.cache.find(r => r.name === name);

  if (!role) {
    role = await guild.roles.create({
      name,
      color,
      reason: 'Community setup'
    });
  }

  return role;
}

async function getCategory(guild, name) {
  let category = guild.channels.cache.find(
    c => c.type === ChannelType.GuildCategory && c.name === name
  );

  if (!category) {
    category = await guild.channels.create({
      name,
      type: ChannelType.GuildCategory
    });
  }

  return category;
}

async function getTextChannel(guild, name, category) {
  let channel = guild.channels.cache.find(
    c => c.name === name && c.parentId === category.id
  );

  if (!channel) {
    channel = await guild.channels.create({
      name,
      type: ChannelType.GuildText,
      parent: category.id
    });
  }

  return channel;
}

async function getVoiceChannel(guild, name, category) {
  let channel = guild.channels.cache.find(
    c => c.name === name && c.parentId === category.id
  );

  if (!channel) {
    channel = await guild.channels.create({
      name,
      type: ChannelType.GuildVoice,
      parent: category.id
    });
  }

  return channel;
}

client.once('ready', async () => {
  console.log(`Bot online: ${client.user.tag}`);

  const rest = new REST({ version: '10' })
    .setToken(process.env.BOT_TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.GUILD_ID
    ),
    { body: [command.toJSON()] }
  );

  console.log('Setup command registered.');
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'setup') return;

  await interaction.reply({
    content: 'Creating ROB RUN COMMUNITY structure...',
    ephemeral: true
  });

  try {
    const guild = interaction.guild;

    for (const role of rolesList) {
      await getRole(guild, role.name, role.color);
    }

    for (const [categoryName, channels] of Object.entries(categories)) {
      const category = await getCategory(guild, categoryName);

      for (const channelName of channels) {
        await getTextChannel(guild, channelName, category);
      }
    }

    const voiceCategory = await getCategory(guild, '05・VOICE');

    const voiceNames = [
      'Lobby 1',
      'Lobby 2',
      'Lobby 3',
      'Lobby 4',
      'Squad 1',
      'Squad 2',
      'Squad 3',
      'Squad 4',
      'AFK'
    ];

    for (const name of voiceNames) {
      await getVoiceChannel(guild, name, voiceCategory);
    }

    await interaction.editReply(
      'ROB RUN COMMUNITY setup completed!'
    );

  } catch (error) {
    console.error(error);

    await interaction.editReply(
      'Setup failed. Check the bot permissions and console.'
    );
  }
});

client.login(process.env.BOT_TOKEN);

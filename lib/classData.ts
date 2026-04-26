export interface Subclass {
  name: string;
  description: string;
}

export interface CharacterClass {
  name: string;
  icon: string;
  description: string;
  color: string; // tailwind color key
  subclasses: Subclass[];
}

export const DND_CLASSES: CharacterClass[] = [
  {
    name: 'Barbarian',
    icon: '⚔️',
    description: 'A fierce warrior driven by primal rage, excelling in brutal melee combat.',
    color: 'red',
    subclasses: [
      { name: 'Path of the Berserker', description: 'Channels fury into a devastating frenzy of attacks.' },
      { name: 'Path of the Totem Warrior', description: 'Draws power from spirit animals for supernatural might.' },
      { name: 'Path of the Ancestral Guardian', description: 'Calls upon ancestral spirits to shield allies.' },
      { name: 'Path of the Storm Herald', description: 'Emanates elemental energy while raging.' },
    ],
  },
  {
    name: 'Bard',
    icon: '🎵',
    description: 'A charismatic performer who weaves magic through music, words, and art.',
    color: 'purple',
    subclasses: [
      { name: 'College of Lore', description: 'Seeks knowledge and wields cutting words against foes.' },
      { name: 'College of Valor', description: 'Inspires allies and fights alongside them in battle.' },
      { name: 'College of Glamour', description: 'Channels fey magic to captivate and command.' },
      { name: 'College of Swords', description: 'Performs dazzling blade flourishes in combat.' },
    ],
  },
  {
    name: 'Cleric',
    icon: '✝️',
    description: 'A divine servant who channels the power of their deity to heal and protect.',
    color: 'yellow',
    subclasses: [
      { name: 'Life Domain', description: 'Masters of healing magic and sustaining life force.' },
      { name: 'Light Domain', description: 'Wields radiant fire and banishes darkness.' },
      { name: 'War Domain', description: 'A holy warrior blessed with martial prowess.' },
      { name: 'Tempest Domain', description: 'Commands the destructive power of storms.' },
    ],
  },
  {
    name: 'Druid',
    icon: '🌿',
    description: 'A keeper of the old faith who commands the forces of nature itself.',
    color: 'green',
    subclasses: [
      { name: 'Circle of the Moon', description: 'Transforms into powerful beast forms in combat.' },
      { name: 'Circle of the Land', description: 'Draws extra spells from the land itself.' },
      { name: 'Circle of Spores', description: 'Harnesses the cycle of decay and rebirth.' },
      { name: 'Circle of Stars', description: 'Channels celestial power through star maps.' },
    ],
  },
  {
    name: 'Fighter',
    icon: '🛡️',
    description: 'A master of martial combat, skilled with every weapon and armor.',
    color: 'orange',
    subclasses: [
      { name: 'Champion', description: 'A born warrior who scores devastating critical hits.' },
      { name: 'Battle Master', description: 'Uses tactical maneuvers to control the battlefield.' },
      { name: 'Eldritch Knight', description: 'Blends weapon skill with arcane spellcasting.' },
      { name: 'Echo Knight', description: 'Summons echoes from alternate timelines to fight.' },
    ],
  },
  {
    name: 'Monk',
    icon: '👊',
    description: 'A martial artist who harnesses the power of ki for extraordinary feats.',
    color: 'cyan',
    subclasses: [
      { name: 'Way of the Open Hand', description: 'Perfects unarmed strikes with devastating techniques.' },
      { name: 'Way of Shadow', description: 'Moves through darkness like a living shadow.' },
      { name: 'Way of the Four Elements', description: 'Channels ki into elemental attacks.' },
      { name: 'Way of the Astral Self', description: 'Manifests spectral arms of astral energy.' },
    ],
  },
  {
    name: 'Paladin',
    icon: '⚜️',
    description: 'A holy knight bound by sacred oaths, wielding divine power in combat.',
    color: 'amber',
    subclasses: [
      { name: 'Oath of Devotion', description: 'Upholds the highest ideals of justice and virtue.' },
      { name: 'Oath of Vengeance', description: 'Pursues justice against those who commit grievous sins.' },
      { name: 'Oath of the Ancients', description: 'Protects the light against the darkness.' },
      { name: 'Oath of Conquest', description: 'Seeks to dominate and crush all opposition.' },
    ],
  },
  {
    name: 'Ranger',
    icon: '🏹',
    description: 'A skilled hunter and tracker who protects the boundaries of civilization.',
    color: 'emerald',
    subclasses: [
      { name: 'Hunter', description: 'Specializes in fighting the most dangerous prey.' },
      { name: 'Beast Master', description: 'Forms a mystical bond with a loyal beast companion.' },
      { name: 'Gloom Stalker', description: 'Hunts in the deepest darkness, unseen and lethal.' },
      { name: 'Fey Wanderer', description: 'Channels the beguiling magic of the Feywild.' },
    ],
  },
  {
    name: 'Rogue',
    icon: '🗡️',
    description: 'A cunning trickster who uses stealth and guile to overcome obstacles.',
    color: 'zinc',
    subclasses: [
      { name: 'Thief', description: 'A master burglar with lightning-fast hands.' },
      { name: 'Assassin', description: 'Eliminates targets with lethal precision strikes.' },
      { name: 'Arcane Trickster', description: 'Blends roguish skills with illusion magic.' },
      { name: 'Swashbuckler', description: 'A dashing duelist who charms and outmaneuvers foes.' },
    ],
  },
  {
    name: 'Sorcerer',
    icon: '✨',
    description: 'A spellcaster who draws on inherent magical power flowing through their blood.',
    color: 'rose',
    subclasses: [
      { name: 'Draconic Bloodline', description: 'Channels the elemental power of dragon ancestry.' },
      { name: 'Wild Magic', description: 'Casts spells with chaotic and unpredictable surges.' },
      { name: 'Shadow Magic', description: 'Wields magic from the Shadowfell itself.' },
      { name: 'Aberrant Mind', description: 'Possesses psionic powers from an alien influence.' },
    ],
  },
  {
    name: 'Warlock',
    icon: '🔮',
    description: 'A wielder of eldritch power gained through a pact with an otherworldly being.',
    color: 'violet',
    subclasses: [
      { name: 'The Fiend', description: 'Pacts with demons and devils for destructive power.' },
      { name: 'The Archfey', description: 'Bargains with fey lords for beguiling magic.' },
      { name: 'The Great Old One', description: 'Communes with eldritch horrors beyond comprehension.' },
      { name: 'The Hexblade', description: 'Bound to a sentient weapon from the Shadowfell.' },
    ],
  },
  {
    name: 'Wizard',
    icon: '📖',
    description: 'A scholarly magic-user who commands arcane power through study and intellect.',
    color: 'blue',
    subclasses: [
      { name: 'School of Evocation', description: 'Masters of explosive damage spells.' },
      { name: 'School of Abjuration', description: 'Specializes in protective and warding magic.' },
      { name: 'School of Necromancy', description: 'Commands the forces of death and undeath.' },
      { name: 'School of Divination', description: 'Sees the future and manipulates fate.' },
    ],
  },
];

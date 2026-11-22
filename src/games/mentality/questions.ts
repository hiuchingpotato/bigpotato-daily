import type { Prompt } from '../herd/prompts'

/**
 * Herd Mentality's questions, with the answers a crowd actually gives and roughly how
 * often. Players are about 70% UK + US and 30% everywhere else, so the bank is split:
 *
 * - SHARED (~70%): topics UK and US players both know. UK and US names for the same
 *   thing sit in one answer as aliases (crisps/chips, biscuit/cookie, mum/mom), and
 *   lists mix both countries' answers so neither side is locked out.
 * - WORLD (~30%): universal topics (animals, food, colours, landmarks, global stars and
 *   brands) where non-western answers carry real weight (naan, Diwali, Burj Khalifa).
 *
 * One question per line:  Question|Answer/alias/alias:weight|Answer:weight|...
 * Weights are rough shares of the crowd, summing to about 100, most popular first.
 * Aliases are only other ways of saying the same answer; matching already forgives
 * case, accents, punctuation, "the", plurals, small typos and the question's own words.
 */
const SHARED = `
Name a breakfast cereal.|Cornflakes:22|Cheerios:16|Frosted Flakes/frosties:12|Weetabix:10|Rice Krispies/rice bubbles:9|Coco Pops/cocoa krispies:7|Special K:6|Bran Flakes:4|Shreddies:3|Lucky Charms:3|Granola:3|Muesli:2|Shredded Wheat:2|Cinnamon Toast Crunch:1
Name a famous Steven or Steve.|Steven Spielberg/spielberg:30|Steve Jobs/jobs:26|Stephen King/king:12|Steve Carell/carell:6|Steve Martin:6|Steve Irwin/irwin:6|Stephen Hawking/hawking:5|Steven Gerrard/gerrard:4|Stephen Fry/fry:2|Steve Harvey/harvey:2|Steven Tyler/tyler:1
What is the worst vegetable?|Brussels sprouts/sprouts:40|Celery:10|Eggplant/aubergine:9|Beets/beetroot:8|Mushroom:7|Cauliflower:6|Broccoli:6|Peas:4|Kale:4|Okra:3|Lima beans/butter beans:2|Turnip:1
Describe chocolate in one word.|Delicious:30|Yummy/yum:14|Sweet:13|Heavenly:8|Addictive:7|Creamy:6|Rich:6|Smooth:5|Indulgent:4|Life:3|Happiness:2|Brown:2
What's another name for a toilet?|Bathroom:26|Loo:22|Restroom:12|Lavatory/lav:9|John:7|Bog:6|WC/water closet:5|Throne:5|Washroom:3|Head:2|Privy:2|Dunny:1
You can take one item to a desert island. What is it?|Knife/penknife/swiss army knife/pocket knife:24|Phone/cell phone/mobile:14|Book:10|Lighter/matches:10|Water:8|Boat:7|Rope:5|Tent:4|Hammock:3|Fishing rod/fishing pole:3|Guitar:2|Sunscreen/sun cream:2|Satellite phone:1
Name a famous wizard.|Harry Potter/harry:34|Gandalf:30|Merlin:14|Dumbledore:12|Voldemort:3|The Wizard of Oz/oz:3|Doctor Strange:2|Sorcerer's Apprentice/mickey mouse:1|Rincewind:1
What's the best cookie or biscuit to dunk in a hot drink?|Oreo:30|Digestive/chocolate digestive:16|Chocolate chip cookie/chocolate chip:14|Ginger snap/ginger nut:8|Biscotti:8|Hobnob:6|Rich Tea:5|Shortbread:5|Biscoff/lotus:3|Graham cracker:3|Custard Cream:2
What's the best pizza topping?|Pepperoni:40|Cheese/extra cheese:12|Mushroom:11|Sausage:8|Ham:7|Pineapple:7|Chicken:4|Olives:4|Onion:3|Jalapenos:2|Peppers/bell peppers:1|Anchovies:1
Name a famous ship.|Titanic:60|Mayflower:9|Black Pearl:6|Noah's Ark/ark:5|Queen Mary:4|Santa Maria:4|Enterprise/starship enterprise:4|Mary Rose:2|Cutty Sark:2|Bismarck:2|HMS Victory/victory:2
Name something you take to the beach.|Towel:40|Sunscreen/sun cream/suncream/sunblock:22|Umbrella/parasol:9|Bucket and spade/bucket/spade/pail and shovel:8|Swimsuit/swimming costume/bathing suit:6|Sunglasses:5|Cooler/cool box:3|Book:3|Beach chair/deckchair:2|Ball/football:2
What's the best day of the week?|Saturday:48|Friday:34|Sunday:12|Wednesday:2|Thursday:2|Monday:1|Tuesday:1
Name a James Bond actor.|Sean Connery/connery:32|Daniel Craig/craig:30|Roger Moore/moore:16|Pierce Brosnan/brosnan:13|Timothy Dalton/dalton:4|George Lazenby/lazenby:3|David Niven/niven:1|Barry Nelson:1
Name a type of dog.|Labrador/lab:30|Golden Retriever/retriever:12|Poodle:10|German Shepherd/alsatian:9|Dachshund/sausage dog/wiener dog:8|Beagle:7|Bulldog:6|Pug:5|Chihuahua:5|Corgi:3|Husky:3|Dalmatian:1|Spaniel/cocker spaniel:1
What's the best flavour of crisps (or chips)?|Salt and vinegar:26|Cheese and onion:16|Sour cream and onion/sour cream and chive:16|Plain/ready salted/original/salted:14|Barbecue/bbq:12|Prawn cocktail:4|Salt and pepper:3|Jalapeno:3|Cheddar:2|Dill pickle/pickle:2|Ketchup:1|Smoky bacon:1
Name a Simpsons character.|Homer/homer simpson:46|Bart/bart simpson:26|Marge:8|Lisa:7|Mr Burns/burns:5|Ned Flanders/flanders:3|Krusty:2|Maggie:1|Apu:1|Moe:1
Name a Christmas song.|All I Want for Christmas Is You/all i want for christmas:30|Jingle Bells:18|Last Christmas:14|White Christmas:8|Silent Night:8|Rudolph the Red-Nosed Reindeer/rudolph:6|Fairytale of New York:4|Frosty the Snowman/frosty:3|Feliz Navidad:3|Santa Claus Is Coming to Town:3|Driving Home for Christmas:2|Jingle Bell Rock:1
What's the best flavour of ice cream?|Vanilla:28|Chocolate:26|Mint choc chip/mint chocolate chip:12|Strawberry:10|Cookie dough:7|Cookies and cream:6|Salted caramel:4|Rocky road:3|Pistachio:2|Neapolitan:1|Butter pecan:1
Name a type of cheese.|Cheddar:46|Mozzarella:12|Brie:10|Parmesan:8|Swiss:5|Feta:4|American:4|Camembert:3|Gouda:3|Stilton:2|Blue cheese/blue:2|Halloumi:1
Name something you find in a garden or backyard.|Flowers:32|Grass/lawn:20|Tree:9|Shed:8|Gnome/garden gnome:6|Plants:6|Worms:5|Swing/swing set:4|Barbecue/bbq/grill:3|Pond:2|Hose:2|Trampoline:2|Bench:1
Name a famous queen.|Queen Elizabeth/elizabeth/elizabeth ii:50|Cleopatra:12|Queen Victoria/victoria:10|Beyonce/queen bey:8|Freddie Mercury/freddie:5|Elsa:5|Marie Antoinette:4|Queen Latifah/latifah:2|Mary Queen of Scots:2|Nefertiti:1|Boudicca:1
Name a board game.|Monopoly:50|Scrabble:14|Clue/cluedo:10|Chess:8|Trivial Pursuit:4|Snakes and Ladders/chutes and ladders:4|Risk:3|Operation:2|Connect Four/connect 4:2|Guess Who:2|Catan/settlers of catan:1
What's the best takeaway (or takeout)?|Pizza:30|Chinese:28|Indian/curry:16|Burger:8|Thai:5|Mexican/tacos:4|Sushi/japanese:3|Fish and chips:3|Fried chicken/kfc:2|Kebab:1
Name a Disney film.|The Lion King:28|Frozen:22|Snow White:9|Aladdin:8|Beauty and the Beast:7|The Little Mermaid:6|Cinderella:5|Toy Story:4|Moana:4|Bambi:3|Encanto:2|Fantasia:1|Mulan:1
Name a sandwich filling.|Ham:18|Cheese:16|Turkey:12|Tuna/tuna mayo:10|Peanut butter and jelly/peanut butter and jam/pbj:10|Chicken:8|BLT/bacon lettuce and tomato:8|Egg/egg mayo/egg salad:6|Roast beef:4|Bacon:4|Cheese and pickle:2|Salami:2
What's the best time to wake up on a weekend?|9am/nine:38|10am/ten:24|8am/eight:15|11am/eleven:8|7am/seven:6|Noon/midday/12pm:5|6am/six:2|1pm:1|Whenever:1
Name a horror film.|The Exorcist:22|Halloween:14|Scream:12|The Shining:10|It:10|A Nightmare on Elm Street:8|Psycho:6|Saw:5|Jaws:4|The Conjuring:4|Friday the 13th:3|Get Out:2
Name a Muppet.|Kermit/kermit the frog:50|Miss Piggy/piggy:24|Animal:8|Fozzie/fozzie bear:6|Gonzo:5|Elmo:3|Swedish Chef:2|Statler and Waldorf/statler/waldorf:1|Beaker:1
Name a famous Harry.|Harry Potter/potter:34|Harry Styles/styles:28|Prince Harry:24|Harry Houdini/houdini:5|Harry Kane/kane:4|Dirty Harry:2|Harry Truman/truman:1|Harry Hill:1|Harry Connick Jr:1
What's the best dip for fries (or chips)?|Ketchup/tomato ketchup:48|Mayo/mayonnaise:18|Ranch:8|Barbecue sauce/bbq sauce/bbq:7|Gravy:5|Curry sauce:4|Cheese sauce/cheese:4|Vinegar/malt vinegar:3|Garlic mayo/aioli:2|Mustard:1
Name a word people say when they hurt themselves.|Ouch:44|Ow/oww:30|Argh/aargh:6|Ah/ahh:4|Damn:4|Oops:3|Ugh:3|Yikes:2|Oof:2|Eek:1|Crikey:1
Name a Kardashian or Jenner.|Kim/kim kardashian:56|Khloe:12|Kourtney:10|Kylie/kylie jenner:8|Kris/kris jenner:7|Kendall/kendall jenner:5|Rob:1|Caitlyn/caitlyn jenner:1
Name a type of shoe.|Sneakers/trainers:36|Boots:16|High heels/heels:14|Flip flops/thongs:10|Sandals:8|Slippers:6|Loafers:4|Crocs:2|Wellies/wellington boots/rain boots:2|Brogues/oxfords:1|Stilettos:1
Name a gift you'd hate to receive.|Socks:40|Soap/toiletries:12|Underwear:8|Sweater/jumper/christmas jumper:8|Gift card/voucher:6|Candle:6|Book:4|Tie:4|Mug:4|Fruitcake:3|Nothing:2|Money/cash:2|Regift:1
Name a superhero.|Batman:34|Superman:28|Spider-Man/spiderman:20|Iron Man:6|Wonder Woman:5|Captain America:3|Hulk:2|Thor:1|Wolverine:1
Name a cartoon dog.|Scooby-Doo/scooby:50|Snoopy:20|Pluto:9|Goofy:6|Odie:4|Brian/brian griffin:3|Bluey:3|Santa's Little Helper:2|Gromit:2|Clifford:1
Name a party game.|Musical chairs:28|Charades:20|Pass the parcel:10|Twister:8|Musical statues/freeze dance:7|Hide and seek:6|Pin the tail on the donkey:6|Duck duck goose:4|Truth or dare:4|Spin the bottle:3|Simon says:3|Sardines:1
Name a pizza chain.|Domino's:40|Pizza Hut:36|Papa John's:12|Little Caesars:4|Pizza Express:3|Sbarro:2|Papa Murphy's:1|Round Table:1|Chuck E Cheese:1
Name something people do on a Sunday.|Sleep in/lie in:24|Relax/chill:14|Sunday roast/roast dinner:12|Church:10|Brunch:8|Watch sport/watch football:8|Go for a walk/walk:7|Laundry/washing:5|Gardening:4|Read the paper:3|Homework:3|Nothing:2
Name a type of hat.|Baseball cap/cap:32|Beanie/bobble hat/woolly hat/toque:20|Top hat:12|Cowboy hat:10|Sun hat:6|Bowler hat/derby:5|Fedora:5|Beret:4|Sombrero:3|Bucket hat:2|Party hat:1
Name a reason to be late for work.|Traffic:36|Overslept/slept in/alarm:28|Train delayed/train/public transport:10|Car broke down/car trouble:8|School run/kids:6|Weather/snow:4|Hangover:3|Lost keys/keys:2|Doctor's appointment/doctor:1|Dog:1|Flat tire/flat tyre/puncture:1
Name a famous wrestler.|Hulk Hogan/hogan:30|The Rock/dwayne johnson:28|John Cena/cena:16|Stone Cold Steve Austin/stone cold:8|The Undertaker:8|Randy Savage/macho man:3|Ric Flair/flair:3|Andre the Giant:2|Big Daddy:1|Triple H:1
Name something you'd find in a kitchen drawer.|Cutlery/silverware:26|Knives:14|Spoons:10|Forks:8|Scissors:8|Tea towels/dish towels:6|Batteries:5|Takeout menus/takeaway menus/menus:5|Rubber bands/elastic bands:5|Can opener/tin opener:4|Tape/sellotape/scotch tape:3|Foil/tin foil/aluminum foil:3|Sauce packets/ketchup packets:1
Name a TV detective.|Sherlock Holmes/sherlock/holmes:36|Columbo:14|Poirot/hercule poirot:10|Inspector Gadget/gadget:6|Magnum/magnum pi:6|Jessica Fletcher/murder she wrote:6|Miss Marple/marple:5|Monk:4|Inspector Morse/morse:3|Inspector Clouseau/clouseau:3|Luther:3|Veronica Mars:2
Name something people collect.|Stamps:34|Coins:22|Trading cards/pokemon cards/cards:8|Stickers:6|Records/vinyl:6|Shoes/sneakers:5|Comics:4|Dolls:3|Fridge magnets/magnets:3|Postcards:3|Rocks:2|Antiques:2|Funko Pops:1|Teddy bears:1
Name a famous cat.|Garfield:34|Tom/tom and jerry:18|The Cat in the Hat:10|Sylvester:10|Puss in Boots:6|Cheshire Cat:6|Hello Kitty:5|Grumpy Cat:4|Felix:3|Salem:2|Simba:1|Jess:1
What's the worst chore?|Ironing:26|Cleaning the toilet/toilet:20|Washing up/dishes/doing the dishes:18|Vacuuming/hoovering:10|Laundry:8|Dusting:6|Taking out the trash/taking out the bins/bins/trash:5|Cleaning the oven/oven:3|Mopping:2|Making the bed:2
Name a word that rhymes with 'cat'.|Hat:34|Bat:22|Mat:18|Rat:12|Sat:6|Fat:4|Pat:2|Flat:1|Chat:1
Name something you can't live without.|Phone:42|Water:14|Coffee:10|Family:8|Food:6|Internet/wifi:6|Air:4|Chocolate:3|Music:3|Love:2|Bed:1|Dog:1
Name a children's TV show.|Sesame Street:26|Peppa Pig/peppa:18|SpongeBob/spongebob squarepants:12|Teletubbies:10|Bluey:10|Paw Patrol:6|Barney:4|Blue's Clues:4|Thomas the Tank Engine/thomas:3|Dora the Explorer/dora:3|Mister Rogers' Neighborhood/mr rogers:2|Blue Peter:2
What's the best cocktail?|Mojito:24|Margarita:16|Pina colada:14|Cosmopolitan/cosmo:8|Martini:8|Espresso martini:6|Long Island Iced Tea:5|Sex on the Beach:5|Old Fashioned:4|Daiquiri:3|Mai Tai:3|Bloody Mary:2|Aperol spritz/spritz:2
Name an Elvis song.|Hound Dog:26|Jailhouse Rock:16|Suspicious Minds:14|Blue Suede Shoes:10|Can't Help Falling in Love:10|Love Me Tender:6|All Shook Up:5|Heartbreak Hotel:5|Return to Sender:3|Always on My Mind:2|In the Ghetto:2|Viva Las Vegas:1
What's the best thing about Christmas?|Presents/gifts:38|Food/dinner:22|Family:20|Time off/holidays/vacation:5|Decorations/christmas tree:5|Snow:3|Christmas movies/christmas films:2|Carols/music:2|Seeing the kids happy/kids:1|Chocolate:1|Santa:1
What's the worst job?|Toilet cleaner/cleaning toilets:26|Garbage collector/bin man/refuse collector:12|Sewer worker/sewers:12|Telemarketer/call centre/call center:10|Undertaker/mortician:6|Traffic warden/parking attendant:6|Dentist:4|Fast food worker:4|Teacher:4|Accountant:3|Tax collector:3|Cleaner:3
Name a reason you'd call in sick.|Flu:26|Cold:18|Food poisoning:12|Stomach bug/upset stomach:10|Migraine/headache:10|Covid:8|Hangover:6|Bad back/back pain:4|Mental health day:3|Toothache:2|Fever:1
Name a sweet (or candy) that comes in a packet.|Skittles:22|M&M's/mms:20|Haribo/gummy bears:18|Starburst:8|Jelly beans:6|Sour Patch Kids:5|Twizzlers:4|Wine gums:4|Maltesers:4|Smarties:3|Fruit pastilles:2|Nerds:2|Jolly Ranchers:2
Name something you'd take on a picnic.|Sandwiches:40|Blanket/rug/picnic blanket:20|Basket/hamper:8|Crisps/chips:6|Fruit:6|Drinks:5|Napkins:3|Strawberries:3|Wine:3|Cake:2|Ants:2|Cheese:2
Name a potato dish.|Fries/chips/french fries:34|Mashed potato/mash:24|Roast potatoes/roasties:14|Baked potato/jacket potato:10|Hash browns:6|Potato salad:4|Wedges:3|Gratin/dauphinoise:2|Tater tots:1|Rosti:1
Name something you find at a funfair or carnival.|Ferris wheel/big wheel:24|Bumper cars/dodgems:18|Cotton candy/candyfloss:18|Rollercoaster:10|Carousel/merry-go-round:8|Hot dogs:4|Clowns:4|Hook a duck:3|Funnel cake:3|Haunted house/ghost train:3|Coconut shy:2|Toffee apple/candy apple/caramel apple:2|Popcorn:1
Name a TV chef.|Gordon Ramsay/ramsay:44|Jamie Oliver/jamie:18|Nigella Lawson/nigella:8|Julia Child:6|Guy Fieri:6|Martha Stewart:4|Anthony Bourdain/bourdain:4|Emeril Lagasse/emeril:3|Mary Berry:3|Ina Garten:2|Rachael Ray:2
Name something people do on a first date.|Dinner/meal/restaurant:44|Drinks/bar/pub:22|Movies/cinema/film:16|Coffee:8|Walk:3|Bowling:2|Mini golf/crazy golf:2|Kiss:1|Picnic:1|Concert:1
What's the best thing to put on toast?|Butter:34|Jam/jelly:16|Peanut butter:12|Avocado:8|Baked beans/beans:6|Nutella:6|Cheese:5|Marmite/vegemite:4|Honey:4|Cinnamon sugar:2|Egg:2|Marmalade:1
What's the worst sound?|Nails on a chalkboard/nails on a blackboard:36|Alarm clock/alarm:20|Snoring:10|Baby crying/crying baby:8|Loud chewing/chewing:6|Screaming:4|Fork scraping a plate:4|Car alarm:4|Drilling:3|Dentist's drill:2|Mosquito:2|Vuvuzela:1
Name a game you play at a sleepover.|Truth or dare:44|Never have I ever:10|Spin the bottle:8|Charades:8|Would you rather:8|Twister:6|Light as a feather:4|Pillow fight:4|Hide and seek:3|Monopoly:2|Bloody Mary:2|Murder in the dark:1
Name a famous Michael.|Michael Jackson/jackson:56|Michael Jordan/jordan:18|Michael Phelps/phelps:5|Michael J Fox:5|Michael Caine/caine:4|Michael Scott:4|Michael Buble/buble:3|Michael Schumacher/schumacher:2|Michael Douglas:2|Michael Owen:1
What's the worst thing to step on barefoot?|Lego:64|Plug:12|Thumbtack/drawing pin/pin:6|Glass:6|Snail/slug:4|Nail:3|Dog poop/dog poo:2|Bee:1|Hot sand:1|Toy:1
Name a fictional bear.|Winnie the Pooh/pooh:40|Paddington:28|Baloo:8|Yogi Bear/yogi:8|Fozzie:4|Ted:3|Smokey Bear/smokey:2|Rupert:2|Lotso:2|Care Bear:2|Teddy Ruxpin:1
Name a type of cake.|Chocolate:34|Carrot:16|Cheesecake:10|Red velvet:8|Victoria sponge:8|Lemon drizzle/lemon:6|Black Forest:4|Angel food:3|Coffee cake:3|Birthday cake:3|Fruitcake:3|Pound cake:2
Name something you'd find in a handbag (or purse).|Wallet:28|Lipstick/makeup:18|Keys:16|Phone:12|Tissues:7|Hairbrush/brush:4|Gum/chewing gum:4|Receipts:3|Pen:3|Hand sanitiser/hand sanitizer:2|Mints:2|Snacks:1
Name a fictional pig.|Peppa Pig/peppa:40|Miss Piggy/piggy:20|Babe:14|Wilbur:10|Porky Pig/porky:8|Piglet:6|Hamm:1|Napoleon:1
Name a music festival.|Glastonbury:40|Coachella:30|Woodstock:6|Lollapalooza:6|Burning Man:5|Reading/reading and leeds:4|Bonnaroo:2|Download:2|SXSW/south by southwest:2|Tomorrowland:2|Isle of Wight:1
Name a famous Jack.|Jack Nicholson/nicholson:18|Jack Black:16|Jack Sparrow/captain jack sparrow:16|Jack Dawson:6|Jack and the Beanstalk:6|Jack Frost:5|Jack Skellington:5|Jack Ryan:4|Jack Reacher/reacher:4|Jack Bauer/bauer:4|Jack Harlow:3|Jack Grealish/grealish:3|Jack Whitehall/whitehall:3|Jack White:2|Jack Kerouac/kerouac:1
What's the best excuse for not doing homework?|The dog ate it:56|I forgot/forgot:16|Left it at home:12|Didn't understand it:4|I was sick/sick:4|Computer crashed/laptop broke:4|Lost it:3|Too much other homework:1|Family emergency:1
Name a famous ballet.|Swan Lake:54|The Nutcracker:32|Sleeping Beauty:4|Romeo and Juliet:3|Giselle:2|Cinderella:2|Don Quixote:1|Billy Elliot:1|Coppelia:1
Name a famous Charles or Charlie.|King Charles/prince charles/charles iii:48|Charles Darwin/darwin:18|Charles Dickens/dickens:16|Charlie Chaplin/chaplin:6|Ray Charles:4|Charlie Brown:3|Charles Xavier/professor x:3|Charles Barkley/barkley:1|Charles Leclerc/leclerc:1
Name something you'd see at a wedding.|Bride:30|Cake/wedding cake:22|Dress/wedding dress:14|Groom:8|Rings:8|Flowers/bouquet:6|Confetti:4|Dancing:3|Champagne:2|Officiant/vicar/priest:2|Speeches:1
Name a famous mouse.|Mickey Mouse/mickey:64|Jerry:14|Minnie Mouse/minnie:6|Stuart Little:5|Speedy Gonzales:4|Mighty Mouse:2|Fievel:2|Remy:2|Danger Mouse:1
What's the most annoying habit?|Chewing loudly/loud chewing/chewing:30|Being late/lateness:14|Nail biting/biting nails:12|Interrupting:10|Being on your phone/phone:8|Sniffing:6|Snoring:5|Cracking knuckles/knuckle cracking:5|Leaving the toilet seat up/toilet seat:4|Tapping:3|Swearing:2|Burping:1
Name something you'd find at the beach.|Sand:30|Sea/ocean/water:18|Seagull:12|Shells/seashells:12|Waves:5|Crabs:5|Sandcastle:4|Lifeguard:3|Ice cream:3|Seaweed:3|Rocks:2|Surfers:2|Pier:1
What's the best snack?|Chips/crisps:32|Chocolate:26|Popcorn:12|Cookies/biscuits:6|Fruit:5|Pretzels:4|Nuts:4|Cheese:3|Candy/sweets:3|Crackers:2|Ice cream:2|Toast:1
Name a famous Bob.|Bob Marley/marley:36|Bob the Builder:20|Bob Dylan/dylan:16|SpongeBob:8|Bob Ross/ross:8|Bob Hope/hope:4|Bob Geldof/geldof:3|Bob Barker:2|Bob Saget:1|Bob Belcher:1|Bob Hoskins:1
Name a hairstyle.|Ponytail:24|Bob:18|Mullet:14|Buzz cut/crew cut:8|Bun:8|Pixie cut/pixie:6|Braids/plaits:6|Mohawk/mohican:6|Afro:4|Bangs/fringe:2|Dreadlocks/dreads:2|Quiff:1|Pigtails:1
What's the best thing to do on a rainy day?|Watch a movie/watch a film/movie/film:36|Read/read a book:14|Sleep/nap:12|Board games:10|Bake/baking:6|Video games/gaming:6|Watch TV/tv/netflix:6|Jigsaw puzzle/puzzle:3|Jump in puddles/puddles:3|Bath:2|Clean:1|Cook:1
Name a famous Lewis.|Lewis Hamilton/hamilton:64|Lewis Capaldi/capaldi:18|Lewis Carroll/carroll:10|Lewis and Clark/meriwether lewis:3|Jerry Lewis:2|C S Lewis/cs lewis:2|Huey Lewis:1
Name something you'd take on a long car journey.|Snacks/food:36|Music/playlist:16|Water/drinks:12|Phone charger/charger:8|Pillow:6|Car games/games:5|Map/sat nav/gps:5|Sweets/candy:4|Book:3|Headphones:2|Sick bag/barf bag:2|Blanket:1
Name a famous puppet.|Kermit:30|Elmo:12|Miss Piggy:10|Pinocchio:10|Sooty:6|Cookie Monster:6|Big Bird:6|Basil Brush:4|Punch and Judy/mr punch:4|Lamb Chop:3|Gonzo:2|Thunderbirds:2|Oscar the Grouch/oscar:2|Ernie:2
Name a famous Taylor.|Taylor Swift/swift:60|Elizabeth Taylor/liz taylor:14|Taylor Lautner/lautner:8|James Taylor:6|Roger Taylor:3|Taylor Hawkins/hawkins:2|Zachary Taylor:2|Taylor Kitsch/kitsch:1|Taylor Momsen/momsen:1|Taylor Sheridan/sheridan:1
Name a Lord of the Rings character.|Gandalf:34|Frodo:28|Gollum/smeagol:16|Aragorn:8|Legolas:5|Samwise/sam:4|Bilbo:3|Sauron:2|Gimli:2|Saruman:1
Name a famous cowboy.|John Wayne/wayne:36|Woody:18|Clint Eastwood/eastwood:16|Billy the Kid:6|The Lone Ranger:6|Buffalo Bill:4|Roy Rogers:4|Wild Bill Hickok:3|Wyatt Earp:2|Butch Cassidy:2|Jesse James:2|Yosemite Sam:1|Lucky Luke:1
Name a famous ghost.|Casper:46|Beetlejuice:8|Slimer:8|Moaning Myrtle:8|Bloody Mary:6|Nearly Headless Nick:4|The Headless Horseman:4|Jacob Marley/marley:4|Ghost of Christmas Past:3|Sam Wheat/patrick swayze:3|The Canterville Ghost/canterville:2|Blinky:1
Name a fictional school.|Hogwarts:54|Springfield Elementary:8|Rydell High:8|East High:4|Bayside High:4|Xavier's School/xaviers:4|Grange Hill:3|North Shore High:3|Hill Valley High:2|Sunnydale High:2|St Trinian's:2|Degrassi:2|Malory Towers:1|Shermer High:1
Name something you can't do with your eyes open.|Sneeze:60|Sleep:24|Blink:6|Dream:4|Wink:2|Meditate:2|Kiss:1|Relax:1
Name something people forget.|Keys:28|Birthdays:18|Names:16|Passwords:10|Phone:8|Anniversary:6|Glasses:4|Umbrella:3|Wallet:3|Shopping list:2|Lunch:2
Name a famous Mark.|Mark Zuckerberg/zuckerberg:30|Mark Wahlberg/wahlberg:22|Mark Twain/twain:10|Mark Hamill/hamill:10|Mark Ruffalo/ruffalo:8|Marc Anthony:4|Mark Cuban/cuban:4|Mark Ronson/ronson:3|Mark Knopfler/knopfler:2|Mark Rylance/rylance:2|Mark Spitz/spitz:2|Mark Strong:2
Name a famous Matt or Matthew.|Matt Damon/damon:40|Matt LeBlanc/leblanc:14|Matt Smith:12|Matthew McConaughey/mcconaughey:10|Matt Groening/groening:8|Matthew Perry/perry:6|Matt Lucas/lucas:4|Matt Bomer/bomer:2|Matt Dillon/dillon:2|Matty Healy/healy:2
What's the best gift to receive?|Money/cash:30|Chocolate:12|Jewellery/jewelry:12|Gift card/voucher:8|A trip/holiday/vacation/experience:8|Flowers:6|Clothes:5|Perfume:5|Book:4|Phone:3|Gadget/tech:2|Puppy:2
Name a famous horse.|Black Beauty:30|Seabiscuit:10|Red Rum:8|Mr Ed:8|Shadowfax:6|Pegasus:6|Spirit:6|Trigger:4|Silver:4|Bullseye:4|Joey:4|Secretariat:4|Boxer:2|Maximus:2
Name a famous Chris.|Chris Hemsworth/hemsworth:24|Chris Evans/evans:20|Chris Pratt/pratt:14|Chris Martin/martin:10|Chris Rock/rock:10|Christopher Columbus/columbus:6|Chris Pine/pine:6|Chris Hoy/hoy:2|Chris Tucker/tucker:2|Chris Farley/farley:2|Chris Hadfield/hadfield:2|Chris Stapleton/stapleton:2
Name something that makes you cry.|Sad movie/sad film/movie/film:28|Onions/chopping onions:20|A breakup/heartbreak:12|Weddings/happy tears:8|Sad song/music:6|Titanic:5|Stubbing your toe/pain:4|Missing family/homesickness:4|The Notebook:3|Marley and Me:3|Sad book/book:3|Stress:2|Babies:1
Name a famous Tom.|Tom Cruise/cruise:30|Tom Hanks/hanks:28|Tom Holland/holland:10|Tom Jones:6|Tom Hardy/hardy:6|Tom Brady/brady:6|Tom Hiddleston/hiddleston:4|Tom Selleck/selleck:3|Tom Daley/daley:2|Tom Petty/petty:2|Tom Thumb:1|Tom Ford:1|Tom and Jerry/tom cat:1
What's the best Monopoly piece?|Dog/scottie dog:32|Car/racing car:24|Top hat/hat:14|Boot:8|Iron:6|Battleship/ship:6|Thimble:4|Cat:3|Wheelbarrow:2|Penguin:1|Dinosaur/t rex:1
Name a fairy tale.|Cinderella:28|Snow White:16|Little Red Riding Hood/red riding hood:16|Goldilocks/goldilocks and the three bears:10|Hansel and Gretel:8|Jack and the Beanstalk:6|Sleeping Beauty:6|Rapunzel:5|The Three Little Pigs:3|Rumpelstiltskin:1|The Little Mermaid:1
Name something you'd find in a shed.|Spiders:26|Lawnmower/mower:20|Tools:18|Bike/bicycle:10|Spade/shovel:6|Paint:4|Junk:4|Plant pots:3|Rake:3|Ladder:3|Hose:2|Cobwebs:1
Name a TV talent show.|American Idol:24|The X Factor:22|The Voice:14|America's Got Talent/agt:12|Britain's Got Talent/bgt:10|Dancing with the Stars:6|Strictly Come Dancing/strictly:4|The Masked Singer:3|Pop Idol:2|Star Search:2|Stars in Their Eyes:1
Name a type of sauce.|Ketchup/tomato sauce:32|Mayo/mayonnaise:12|BBQ/barbecue:12|Mustard:8|Hot sauce:6|Soy sauce/soy:6|Gravy:4|Ranch:4|Brown sauce/hp:3|Sweet chilli/sweet chili:3|Pesto:3|Tabasco:2|Sriracha:2|Worcestershire:2|Salsa:2
What do you shout on a rollercoaster?|Aaargh/argh/ahh/ah:38|Wheee/whee:22|Help:12|Woohoo:10|Oh my gosh/oh my god/omg:8|Stop:4|Mum/mom/mummy/mommy:3|Yeehaw:2|Faster:1|No:1
Name a famous Mary.|Mary Poppins/poppins:34|Mary Berry/berry:10|Mary Queen of Scots:10|Mary Had a Little Lamb:8|Mary J Blige/blige:6|Mary Shelley/shelley:6|Mary Jane/mary jane watson:6|Mary Tyler Moore:6|Mary-Kate Olsen/mary kate:4|Mary Pickford/pickford:2|Mary Lou Retton:2|Mary Portas/portas:2
What's the most useful kitchen gadget?|Kettle:22|Air fryer:20|Microwave:18|Toaster:10|Blender:8|Coffee machine/coffee maker:8|Can opener/tin opener:4|Food processor:3|Dishwasher:3|Peeler:2|Slow cooker/crockpot:2
Name a word you'd use to describe a baby.|Cute:42|Adorable:14|Tiny/small/little:12|Sweet:8|Precious:6|Beautiful:4|Chubby:4|Loud:4|Smelly:3|Innocent:2|Bundle of joy:1
What's the best breakfast drink?|Coffee:38|Tea:30|Orange juice/oj:20|Milk:4|Smoothie:3|Apple juice:2|Water:2|Hot chocolate:1
Name a famous Ben.|Ben Affleck/affleck:28|Ben Stiller/stiller:18|Big Ben:14|Ben Franklin/benjamin franklin/franklin:10|Ben and Jerry's:8|Ben 10:6|Ben Kingsley/kingsley:4|Ben Kenobi/obi-wan kenobi:4|Ben Stokes/stokes:3|Ben Whishaw/whishaw:2|Ben Platt:1|Gentle Ben:1
Name a chocolate bar.|Snickers:22|Kit Kat:16|Hershey's:12|Mars:10|Dairy Milk/cadbury dairy milk:10|Twix:10|Milky Way:6|Reese's/reeses cups:4|Toblerone:4|Galaxy:2|Crunch:2|Butterfinger:2
What's the worst thing about Monday?|Work/going to work:48|Waking up/alarm:18|The weekend's over/end of the weekend:12|School:6|Traffic:4|Meetings:4|Being tired/tired:3|Commute:2|Emails:2|Everything:1
Name a type of salad.|Caesar:40|Greek:16|Coleslaw:10|Potato:8|Garden:6|Waldorf:4|Fruit:4|Pasta:4|Cobb:3|Caprese:2|Chicken:2|Nicoise:1
Name something you do before bed.|Brush teeth/teeth:50|Read:14|Scroll on my phone/phone:10|Shower/bath:8|Watch TV/tv:6|Skincare:3|Set an alarm/alarm:3|Drink water/water:2|Lock the doors/lock up:2|Go to the toilet/toilet:2
Name a word that goes before 'ball'.|Foot/football:30|Basket/basketball:16|Snow/snowball:12|Base/baseball:10|Volley/volleyball:6|Hand/handball:6|Meat/meatball:5|Net/netball:4|Eye/eyeball:3|Dodge/dodgeball:3|Pin/pinball:2|Golf/golf ball:2|Odd/oddball:1
Name a famous Victoria.|Victoria Beckham/beckham/posh:56|Queen Victoria:30|Victoria Justice/justice:4|Victoria Wood/wood:4|Victoria's Secret:2|Victoria Azarenka/azarenka:2|Victoria Coren Mitchell:1|Victoria Pendleton/pendleton:1
Name a famous David.|David Beckham/beckham:28|David Attenborough/attenborough:22|David Bowie/bowie:18|David Hasselhoff/hasselhoff:6|David Copperfield/copperfield:6|David Schwimmer/schwimmer:5|David Letterman/letterman:5|David Tennant/tennant:4|David Walliams/walliams:2|David Lynch/lynch:2|David Dobrik/dobrik:2
Name something you'd find on a desk.|Computer/laptop:30|Pen:20|Paper:10|Lamp:8|Stapler:8|Mug/coffee cup:6|Notebook/notepad:5|Pencil:4|Phone:3|Calendar:2|Plant:2|Sticky notes/post-it notes/post-its:2
Name a way to say goodbye.|Bye:30|See you later/see ya/see you:20|Goodbye:6|Cheerio:6|Later:6|Ciao:6|Adios:6|Take care:6|Farewell:4|Ta-ta:3|Peace/peace out:2|Toodles/toodle-oo:1
What's the best fast food chain?|McDonald's/maccies:44|KFC:16|Burger King:12|Subway:8|Taco Bell:6|Wendy's:5|Five Guys:3|Chick-fil-A:2|Domino's:2|Greggs:1|In-N-Out:1
Name a famous Anthony or Tony.|Anthony Hopkins/hopkins:36|Tony Hawk/hawk:12|Ant McPartlin/ant:8|Anthony Joshua/joshua:8|Tony Stark/iron man:8|Tony Soprano/soprano:6|Marc Anthony:6|Anthony Bourdain/bourdain:4|Carmelo Anthony/carmelo:3|Tony the Tiger:3|Anthony Kiedis/kiedis:2|Tony Bennett/bennett:2
Name a reason to go to the pub (or a bar).|Drinks/beer:38|Friends/meet friends:20|Watch the game/sports/football:14|Food:8|Quiz/trivia night/trivia:6|Celebration/birthday:6|After work:4|Pool/darts:2|Karaoke:1|Escape:1
Name a famous Pete or Peter.|Peter Pan/pan:34|Peter Parker/spider man:16|Peter Griffin/griffin:12|Peter Rabbit/rabbit:10|Peter Kay/kay:8|Pete Davidson/davidson:6|Peter Andre/andre:4|Peter Jackson:4|Pete Sampras/sampras:2|Peter Crouch/crouch:2|Peter Dinklage/dinklage:2
What's the best way to spend a Friday night?|Takeout/takeaway:26|Drinks/pub/bar:26|Netflix/tv/sofa:18|Party:8|Movie/film:8|Date night/date:4|Dinner out/restaurant:4|Clubbing/dancing:2|Video games/games:2|Sleep:2
Name a type of cookie or biscuit.|Chocolate chip:34|Oreo:18|Digestive:8|Oatmeal raisin:8|Shortbread:6|Ginger snap/ginger nut/gingerbread:5|Peanut butter:5|Snickerdoodle:4|Custard cream:3|Sugar cookie:3|Fortune cookie:2|Jaffa Cake:2|Macaron/macaroon:2
Name a famous Jennifer.|Jennifer Aniston/aniston:34|Jennifer Lopez/jlo/j lo:30|Jennifer Lawrence/lawrence:18|Jennifer Garner/garner:6|Jennifer Hudson/hudson:4|Jennifer Coolidge/coolidge:4|Jennifer Saunders/saunders:2|Jennifer Connelly/connelly:1|Jennifer Love Hewitt/hewitt:1
Name a Friends character.|Joey:26|Chandler:20|Rachel:18|Ross:14|Phoebe:12|Monica:8|Gunther:1|Janice:1
Name a Star Wars character.|Darth Vader/vader:30|Luke Skywalker/luke:16|Yoda:16|Han Solo/han:10|Chewbacca/chewie:8|Princess Leia/leia:8|R2-D2/r2d2:4|C-3PO/c3po:3|Obi-Wan Kenobi/obi-wan:3|Baby Yoda/grogu:2
Name a Harry Potter character who isn't Harry.|Hermione:30|Ron:20|Dumbledore:14|Snape:10|Voldemort:8|Hagrid:8|Draco/malfoy/draco malfoy:4|Dobby:3|Neville:1|Sirius Black/sirius:1|Luna/luna lovegood:1
Name a Toy Story character.|Woody:40|Buzz Lightyear/buzz:34|Mr Potato Head/potato head:6|Jessie:6|Rex:4|Slinky/slinky dog:3|Hamm:2|Bo Peep:2|Andy:1|Lotso:1|Bullseye:1
Name a soft drink (fizzy drink or soda).|Coke/coca-cola/cola:40|Pepsi:14|Sprite:12|Fanta:10|Dr Pepper:6|7Up/seven up:4|Mountain Dew:4|Lemonade:4|Root beer:2|Ginger ale:2|Irn-Bru:2
Name something you'd see at a birthday party.|Cake:40|Balloons:20|Presents/gifts:12|Candles:8|Party hats:5|Games:3|Clown:3|Bouncy castle/bounce house:3|Party bags/goody bags:2|Pinata:2|Magician:1|Banner:1
Name something people do on New Year's Eve.|Party:22|Fireworks:16|Drink/champagne:14|Count down/countdown:14|Kiss:12|Make resolutions/resolutions:6|Sing Auld Lang Syne/auld lang syne:6|Watch the ball drop/ball drop:4|Stay up late:3|Sleep:2|Dance:1
Name a Halloween costume.|Witch:24|Ghost:16|Vampire/dracula:14|Zombie:8|Skeleton:8|Pumpkin:5|Superhero:4|Cat:4|Mummy:4|Pirate:4|Devil:3|Frankenstein:3|Princess:2
Name something in the fridge.|Milk:38|Cheese:12|Butter:10|Eggs:8|Leftovers:6|Juice:5|Beer:4|Yogurt/yoghurt:4|Ketchup:3|Vegetables/veg:3|Ham:2|Light:2|Water:2|Wine:1
Name a famous rock band.|Queen:22|The Beatles:18|The Rolling Stones/the stones:14|Led Zeppelin:8|ACDC/ac dc:6|Nirvana:6|Guns N' Roses/guns and roses:6|Metallica:5|Pink Floyd:5|Foo Fighters:4|Oasis:3|Coldplay:2|Aerosmith:1
Name a Taylor Swift song.|Shake It Off:30|Love Story:18|Blank Space:10|Anti-Hero:8|You Belong With Me:8|Cruel Summer:6|We Are Never Ever Getting Back Together:6|Bad Blood:4|All Too Well:4|Look What You Made Me Do:3|22:2|Cardigan:1
Name a boy band.|One Direction/1d:34|Backstreet Boys:20|NSYNC/n sync:12|Take That:10|BTS:8|Westlife:4|Boyzone:3|New Kids on the Block:3|Jonas Brothers:2|Busted:1|Blue:1|JLS:1|McFly:1
Name a girl group.|Spice Girls:42|Destiny's Child:16|Little Mix:12|Girls Aloud:6|The Supremes:6|TLC:4|Pussycat Dolls:4|Sugababes:3|Blackpink:3|Fifth Harmony:2|Bananarama:1|All Saints:1
Name a Disney princess.|Cinderella:24|Ariel:14|Belle:12|Snow White:12|Elsa:10|Jasmine:8|Aurora/sleeping beauty:6|Rapunzel:5|Moana:4|Mulan:3|Pocahontas:1|Tiana:1
Name a Pixar film.|Toy Story:40|Finding Nemo/nemo:18|Up:8|Monsters Inc:8|Cars:6|The Incredibles:6|Inside Out:4|Coco:3|Ratatouille:3|WALL-E:2|A Bug's Life:1|Brave:1
Name a Tom Hanks film.|Forrest Gump:40|Toy Story:14|Big:10|Cast Away:10|Saving Private Ryan:8|The Green Mile:6|Apollo 13:3|Philadelphia:2|Splash:2|You've Got Mail:2|Sleepless in Seattle:2|The Terminal:1
Name a Christmas film.|Home Alone:30|Elf:18|It's a Wonderful Life:10|Love Actually:8|The Grinch/how the grinch stole christmas:8|Miracle on 34th Street:5|A Christmas Carol/scrooge:5|The Polar Express:4|Die Hard:4|The Santa Clause:3|Jingle All the Way:2|The Muppet Christmas Carol:2|Nativity:1
Name a Christmas decoration.|Tree/christmas tree:26|Lights/fairy lights:18|Tinsel:16|Baubles/ornaments:14|Star:8|Wreath:6|Angel:4|Stockings:3|Candy cane:2|Mistletoe:2|Snowman:1
Name one of Santa's reindeer.|Rudolph:46|Dasher:12|Comet:8|Blitzen:8|Prancer:6|Dancer:6|Cupid:5|Donner/donder:5|Vixen:4
Name something you'd find in a bathroom.|Toilet:30|Toothbrush:16|Bath/bathtub/tub:12|Shower:10|Sink:8|Towel:8|Soap:6|Toilet paper/toilet roll/loo roll:5|Mirror:3|Shampoo:2
Name something in a first aid kit.|Plasters/band-aids/bandaids:34|Bandage:24|Antiseptic/antiseptic wipes:10|Scissors:6|Painkillers/paracetamol/tylenol/aspirin:6|Tweezers:4|Gloves:4|Safety pins:3|Gauze:3|Thermometer:2|Ice pack:2|Sling:2
Name a job where you wear a uniform.|Police officer/police/cop:32|Nurse:16|Soldier:10|Firefighter/fireman:10|Doctor:6|Pilot:6|Chef:4|Mail carrier/postman/mailman:4|Flight attendant/air hostess:4|Security guard:3|Waiter:2|Paramedic:2|Referee:1
Name something you do at the gym.|Lift weights/weights:30|Run/treadmill/running:26|Cycle/spin/exercise bike:8|Sweat:6|Squats:6|Swim:4|Yoga:4|Stretch:4|Rowing:3|Sit-ups/crunches:3|Push-ups/press-ups:2|Take selfies/selfie:2
Name a famous Ryan.|Ryan Reynolds/reynolds:40|Ryan Gosling/gosling:34|Ryan Seacrest/seacrest:6|Private Ryan/saving private ryan:4|Ryan Giggs/giggs:4|Ryan Tedder/tedder:2|Ryan Phillippe/phillippe:2|Ryan Lochte/lochte:2|Ryan Murphy:2|Ryan Coogler/coogler:2|Ryan Garcia:1|Ryan Tubridy/tubridy:1
Name a famous Emma.|Emma Watson/watson:50|Emma Stone/stone:24|Emma Thompson/thompson:10|Emma Bunton/baby spice:6|Emma Roberts/roberts:4|Emma Raducanu/raducanu:4|Emma Willis/willis:1|Emma Chamberlain/chamberlain:1
Name a famous John.|John Lennon/lennon:30|John Travolta/travolta:14|John Cena/cena:10|John Legend/legend:8|John Wayne/wayne:8|John Wick:6|John Cleese/cleese:4|John Krasinski/krasinski:4|John Candy/candy:4|John Bon Jovi/bon jovi:4|John Mayer/mayer:2|John Malkovich/malkovich:2
Name a famous Kevin.|Kevin Hart/hart:34|Kevin Bacon/bacon:20|Kevin Costner/costner:14|Kevin McCallister/kevin from home alone:10|Kevin James:6|Kevin Durant/durant:4|Kevin De Bruyne/de bruyne:4|Kevin Keegan/keegan:2|Kevin the Teenager:2|Kevin Jonas:2|Kevin Malone:2
Name a famous Will or William.|Will Smith:44|Prince William:24|William Shakespeare/shakespeare:14|Will Ferrell/ferrell:8|Will.i.am/william i am:4|Will Young:2|Will Arnett/arnett:2|William Wallace/wallace:1|Will Poulter/poulter:1
Name a famous Paul.|Paul McCartney/mccartney:36|Paul Rudd/rudd:16|Paul Hollywood/hollywood:10|Paul Walker/walker:8|Paul Newman/newman:6|Paul Simon/simon:4|Paul Mescal/mescal:4|Paul Pogba/pogba:3|Paul Revere/revere:3|Paul O'Grady/ogrady:2|Paul Bunyan/bunyan:2|Paul Daniels:1|Paul Scholes/scholes:1
Name a famous Jessica.|Jessica Alba/alba:30|Jessica Simpson/simpson:18|Jessica Rabbit/rabbit:16|Jessica Biel/biel:10|Jessica Chastain/chastain:8|Jessica Fletcher/fletcher:6|Jessica Ennis/ennis:4|Jessica Lange/lange:3|Jessica Jones:2|Jessie J:2|Jessica Hynes/hynes:1
Name a famous Kate or Katie.|Kate Middleton/princess kate/catherine princess of wales:36|Kate Winslet/winslet:16|Kate Moss/moss:14|Katy Perry/perry:12|Katie Holmes/holmes:8|Kate Hudson/hudson:6|Katie Price/price:4|Kate Bush/bush:2|Kate McKinnon/mckinnon:2
Name a famous Sarah.|Sarah Jessica Parker/sjp:40|Sarah Michelle Gellar/buffy:14|Sarah Connor:8|Sarah Paulson/paulson:8|Sarah Silverman/silverman:6|Sarah Millican/millican:6|Sarah Ferguson/fergie:6|Sarah Hyland/hyland:3|Sarah Lancashire/lancashire:2|Sarah Snook/snook:2|Sarah McLachlan/mclachlan:2
Name a famous Bond villain.|Blofeld:36|Jaws:16|Goldfinger:14|Dr No:12|Oddjob:6|Le Chiffre:4|Scaramanga:4|Silva:3|Rosa Klebb:2|Zorin/max zorin:2|Mr Big:1
Name a type of sandwich.|BLT:26|Club:16|Grilled cheese/cheese toastie/toastie:14|PB&J/pbj:10|Reuben:6|Sub/hoagie/hero:6|Philly cheesesteak/cheesesteak:6|Tuna melt:4|Cuban:3|Croque monsieur:3|Panini:3|Ploughman's:2|Banh mi:1
Name a burger topping.|Cheese:38|Lettuce:14|Bacon:10|Tomato:10|Onion:8|Pickles/gherkins:8|Ketchup:4|Mayo/mayonnaise:2|Mustard:2|Jalapenos:1|Avocado:1|Fried egg/egg:1|Mushrooms:1
Name a doughnut (or donut) flavour.|Chocolate:24|Glazed:22|Jam/jelly/raspberry:18|Sprinkles:8|Custard/boston cream:8|Cinnamon sugar/cinnamon:6|Strawberry:4|Maple:3|Caramel:3|Plain/powdered:2|Apple:1
Name a sitcom.|Friends:40|The Office:14|The Big Bang Theory:8|Seinfeld:6|The Simpsons:6|How I Met Your Mother/himym:5|Fawlty Towers:4|Only Fools and Horses:4|Frasier:4|Cheers:3|Brooklyn Nine-Nine/brooklyn 99:3|Modern Family:2|Gavin and Stacey:1
Name a reality TV show.|Love Island:20|Big Brother:20|Survivor:10|Keeping Up with the Kardashians/the kardashians:10|The Apprentice:8|The Bachelor:8|Real Housewives:6|I'm a Celebrity:6|Jersey Shore:4|Married at First Sight:4|The Only Way Is Essex/towie:2|Made in Chelsea:2
Name a famous comedian.|Kevin Hart:16|Jim Carrey/carrey:12|Robin Williams:12|Rowan Atkinson/mr bean:10|Eddie Murphy/murphy:8|Ricky Gervais/gervais:8|Peter Kay:6|Jerry Seinfeld/seinfeld:6|Michael McIntyre/mcintyre:6|Chris Rock:6|Dave Chappelle/chappelle:4|Billy Connolly/connolly:2|Ellen DeGeneres/ellen:2|Steve Martin:2
Name a famous magician.|David Copperfield/copperfield:30|Harry Houdini/houdini:30|David Blaine/blaine:16|Dynamo:6|Penn and Teller:6|Derren Brown:4|Criss Angel:3|Paul Daniels:2|Siegfried and Roy:2|Merlin:1
Name a Disney villain.|Scar:22|Ursula:18|Maleficent:16|Cruella de Vil/cruella:14|Jafar:8|Captain Hook/hook:6|The Evil Queen:6|Gaston:4|Hades:2|Mother Gothel:2|Shere Khan:1|Hans:1
Name something you'd take on a camping trip.|Tent:46|Sleeping bag:16|Flashlight/torch:10|Marshmallows:4|Food:4|Camping stove/stove:4|Matches/lighter:3|Water:3|Bug spray/insect repellent:2|Pillow:1|Camping chair/chair:1|Map:1|Firewood:1
Name something you'd find in a toolbox.|Hammer:40|Screwdriver:24|Nails:8|Wrench/spanner:8|Screws:6|Pliers:5|Tape measure:4|Saw:2|Drill:1|Level/spirit level:1|Allen key:1
Name something you plug in.|Phone charger/charger:24|TV/television:12|Kettle:12|Computer/laptop:10|Hair dryer/hairdryer:10|Lamp:8|Toaster:6|Vacuum/hoover:5|Fridge:3|Iron:3|Microwave:3|Christmas lights:2|Hair straighteners/straighteners:2
Name a famous children's author.|Roald Dahl/dahl:36|Dr Seuss/seuss:22|J K Rowling/jk rowling/rowling:14|Beatrix Potter/potter:6|Enid Blyton/blyton:6|Julia Donaldson/donaldson:4|Judy Blume/blume:3|Eric Carle/carle:2|Shel Silverstein/silverstein:2|David Walliams/walliams:2|Maurice Sendak/sendak:1|Lewis Carroll/carroll:1|A A Milne/aa milne/milne:1
Name a Roald Dahl book.|Charlie and the Chocolate Factory:38|Matilda:20|The BFG:12|James and the Giant Peach:10|The Witches:8|Fantastic Mr Fox:6|The Twits:4|George's Marvellous Medicine:1|Danny the Champion of the World:1
Name a nursery rhyme.|Twinkle Twinkle Little Star/twinkle twinkle:26|Humpty Dumpty:18|Baa Baa Black Sheep:12|Mary Had a Little Lamb:10|Jack and Jill:8|Hickory Dickory Dock:6|Incy Wincy Spider/itsy bitsy spider:6|Old MacDonald Had a Farm/old macdonald:5|Hey Diddle Diddle:3|Little Miss Muffet:2|The Wheels on the Bus:2|Three Blind Mice:2
Name a card game.|Poker:22|Uno:12|Snap:10|Go Fish:10|Solitaire/patience:10|Blackjack/pontoon/twenty one:10|Rummy/gin rummy:8|Bridge:5|Old Maid:3|Crazy Eights:2|War:2|Cheat/bs:2|Hearts:2|Spades:2
Name something you associate with Halloween.|Pumpkin:30|Trick or treat/trick or treating:16|Candy/sweets:12|Witch:8|Costume/fancy dress:8|Ghost:6|Bats:4|Skeleton:3|Spiders:3|Black cat:3|Vampire:2|Jack-o'-lantern:2|Haunted house:1
Name a fictional villain.|Darth Vader/vader:28|The Joker:22|Voldemort:16|Hannibal Lecter/hannibal:6|Thanos:6|Freddy Krueger/freddy:4|Scar:4|Cruella de Vil/cruella:4|Sauron:3|Dracula:2|Lex Luthor:2|Captain Hook:2|The Grinch:1
Name a famous duo.|Batman and Robin:16|Tom and Jerry:14|Ant and Dec:12|Laurel and Hardy:10|Simon and Garfunkel:6|Bonnie and Clyde:6|Wallace and Gromit:6|Bert and Ernie:6|Romeo and Juliet:6|Sonny and Cher:4|Mario and Luigi:4|Thelma and Louise:4|Penn and Teller:2|Hall and Oates:2|Key and Peele:2
Name something you take on holiday (or vacation).|Passport:34|Suitcase:14|Sunscreen/sun cream:10|Swimsuit/swimming costume:8|Camera:6|Phone:6|Clothes:6|Sunglasses:6|Money/cash:4|Book:3|Toothbrush:2|Charger:1
Name a holiday (or vacation) destination.|Spain:16|Florida:14|Hawaii:10|Paris:8|Greece:8|Mexico:8|Italy:8|Las Vegas/vegas:6|New York:6|Disney World/disneyland/disney:6|Bali:4|Maldives:3|Thailand:3
Name an American state.|California:26|Texas:22|Florida:16|New York:14|Hawaii:6|Alaska:4|Nevada:2|Washington:2|Georgia:2|Ohio:2|Colorado:2|Arizona:2
Name a British city.|London:50|Manchester:14|Liverpool:10|Birmingham:6|Edinburgh:6|Glasgow:4|Oxford:2|Bristol:2|Cardiff:2|Leeds:2|Cambridge:1|Belfast:1
Name an American city.|New York/nyc:40|Los Angeles/la:20|Chicago:8|Las Vegas/vegas:8|Miami:6|San Francisco:6|Washington DC/dc:4|Boston:3|Seattle:2|New Orleans:2|Orlando:1
Name something you'd find in a school.|Teacher:34|Desk:16|Whiteboard/blackboard/board:12|Books:10|Students/pupils/kids:10|Chairs:4|Pencils/pens:4|Lockers:3|Principal/headteacher/head teacher:3|Cafeteria/canteen/lunch hall:2|Bell:1|Homework:1
Name a famous Shakespeare play.|Romeo and Juliet:44|Hamlet:20|Macbeth:16|A Midsummer Night's Dream:6|Othello:4|King Lear:3|Julius Caesar:2|The Tempest:2|Much Ado About Nothing:1|Twelfth Night:1|The Merchant of Venice:1
`

const WORLD = `
Name a planet.|Mars:34|Jupiter:18|Saturn:14|Earth:10|Venus:8|Mercury:6|Neptune:4|Uranus:3|Pluto:2|The Sun:1
Name a black and white animal.|Zebra:42|Panda:26|Penguin:15|Cow:7|Skunk:4|Badger:2|Orca/killer whale:2|Dalmatian:1|Magpie:1
Name a type of whale.|Blue whale/blue:42|Killer whale/orca:24|Humpback/humpback whale:16|Sperm whale/sperm:8|Beluga:4|Narwhal:2|Whale shark:2|Minke:1|Grey whale/gray whale/grey:1
Name something that falls from the sky.|Rain:54|Snow:16|Hail:8|Meteor/meteorite/shooting star:6|Leaves:4|Bird poop/bird poo:4|Plane:2|Lightning:2|Coconut:2|Parachute/skydiver:1|Frogs:1
Name a fruit that's red.|Strawberry:38|Apple:22|Cherry:16|Raspberry:8|Pomegranate:5|Watermelon:4|Tomato:2|Lychee:2|Cranberry:1|Dragon fruit:1|Red grapes/grape:1
Name a colour of the rainbow.|Red:32|Blue:20|Green:14|Yellow:12|Orange:8|Purple:5|Violet:5|Indigo:4
Name a famous painter.|Pablo Picasso/picasso:30|Vincent van Gogh/van gogh:28|Leonardo da Vinci/da vinci/leonardo:14|Claude Monet/monet:8|Michelangelo:5|Frida Kahlo/kahlo:5|Rembrandt:3|Salvador Dali/dali:3|Banksy:2|Hokusai:1|Andy Warhol/warhol:1
Name a sport played with a ball.|Football/soccer:50|Basketball:12|Tennis:10|Cricket:10|Volleyball:4|Rugby:4|Baseball:4|Golf:3|Table tennis/ping pong:2|Handball:1
Name a famous scientist.|Albert Einstein/einstein:50|Isaac Newton/newton:18|Stephen Hawking/hawking:8|Marie Curie/curie:7|Charles Darwin/darwin:7|Nikola Tesla/tesla:4|Galileo:3|Thomas Edison/edison:2|Abdul Kalam/apj abdul kalam:1
Name a type of pasta.|Spaghetti:44|Penne:16|Macaroni:12|Fusilli:8|Lasagne/lasagna:6|Ravioli:4|Fettuccine:4|Tagliatelle:2|Linguine:2|Farfalle/bow tie:1|Tortellini:1
Name something that's yellow.|Banana:40|Sun:26|Lemon:12|Sunflower:5|Corn/sweetcorn:4|Cheese:3|Taxi:2|Mango:2|Egg yolk/yolk:2|Rubber duck/duck:2|School bus:1|Minion:1
Name a dance.|Salsa:20|Tango:16|Waltz:14|Ballet:10|Hip hop:8|Samba:6|Bhangra:4|Belly dance/belly dancing:4|Breakdance/breakdancing:4|Flamenco:4|Bollywood:4|Tap:3|Macarena:2|K-pop dance/kpop:1
Name a farm animal.|Cow:38|Pig:20|Sheep:16|Chicken:12|Horse:6|Goat:5|Duck:2|Buffalo:1
Name an Olympic sport.|Athletics/running/track:24|Swimming:22|Gymnastics:12|Football/soccer:6|Basketball:6|Cycling:5|Boxing:4|Badminton:4|Diving:4|Rowing:3|Table tennis:3|Wrestling:2|Fencing:2|Judo:2|Archery:1
Name a hot drink.|Tea:42|Coffee:34|Hot chocolate/cocoa:14|Chai/masala chai:3|Green tea:3|Matcha:1|Soup:1|Hot water:1|Mulled wine:1
Name something people are scared of.|Spiders:40|Snakes:16|Heights:14|The dark:8|Clowns:6|Ghosts:5|Sharks:3|Needles:3|Flying:2|Public speaking:2|Dogs:1
Name an animal with a tail.|Dog:36|Cat:26|Monkey:10|Horse:6|Mouse:5|Fox:4|Lion:3|Squirrel:3|Fish:2|Lizard:2|Cow:1|Kangaroo:1|Peacock:1
What's the best smell?|Fresh bread/bread:24|Coffee:18|Cut grass/freshly cut grass:12|Flowers:10|Rain:10|Baking/cookies:6|Perfume:4|Vanilla:3|Bacon:3|Lavender:3|Roses:3|Jasmine:2|The sea/ocean:2
Name a famous tower.|Eiffel Tower/eiffel:54|Leaning Tower of Pisa/pisa/leaning tower:18|Burj Khalifa:8|CN Tower:4|Tower of London:4|Tokyo Tower/tokyo skytree:3|Big Ben:3|Empire State Building/empire state:3|Blackpool Tower:1|Petronas Towers/petronas:1|Space Needle:1
Name something that's cold.|Ice:40|Snow:18|Ice cream:10|Fridge:8|Freezer:6|Winter:6|Antarctica/north pole/south pole:4|Penguin:2|Glacier:2|Water:2|Wind:2
Name a country in Africa.|Egypt:26|South Africa:20|Nigeria:14|Kenya:12|Morocco:6|Ghana:6|Ethiopia:5|Tanzania:3|Uganda:2|Zimbabwe:2|Madagascar:2|Senegal:1|Algeria:1
Name a famous Italian.|Leonardo da Vinci/da vinci:22|Luciano Pavarotti/pavarotti:12|Julius Caesar/caesar:10|Michelangelo:10|Super Mario/mario:8|Galileo:6|Marco Polo:6|Christopher Columbus/columbus:4|Andrea Bocelli/bocelli:4|Sophia Loren/loren:3|Valentino Rossi/rossi:3|Enzo Ferrari/ferrari:3|Giorgio Armani/armani:3|Francesco Totti/totti:2
Name a Greek god.|Zeus:50|Poseidon:14|Hades:8|Apollo:8|Athena:6|Aphrodite:5|Hermes:4|Ares:3|Hera:1|Hercules:1
Name a type of tree.|Oak:40|Pine:12|Palm:10|Fir/christmas tree:6|Apple:6|Birch:5|Maple:5|Willow:4|Cherry blossom/cherry/sakura:3|Banyan:2|Coconut:2|Mango:2|Baobab:1|Redwood/sequoia:1
Name a famous tennis player.|Roger Federer/federer:28|Serena Williams/serena:18|Rafael Nadal/nadal/rafa:14|Novak Djokovic/djokovic:12|Andy Murray/murray:6|Venus Williams/venus:4|Maria Sharapova/sharapova:4|Carlos Alcaraz/alcaraz:4|Naomi Osaka/osaka:3|Jannik Sinner/sinner:2|Andre Agassi/agassi:2|Pete Sampras/sampras:1|Billie Jean King:1|Emma Raducanu/raducanu:1
Name something that's sticky.|Glue:34|Honey:26|Tape/sellotape/sticky tape:12|Chewing gum/gum:8|Syrup/maple syrup:6|Toffee/caramel:4|Jam:3|Sticky rice:2|Slime:2|Tree sap/sap:2|Post-it note/post-it:1
Name something that's round.|Ball:44|Circle:10|Wheel:8|Moon:8|Sun:6|Earth/globe:6|Orange:5|Coin:4|Plate:3|Pizza:2|Clock:2|Donut/doughnut:1|Roti:1
Name a type of fish.|Salmon:26|Tuna:18|Cod:14|Goldfish:8|Shark:6|Clownfish/nemo:6|Trout:4|Carp:3|Tilapia:3|Sardine:3|Catfish:3|Mackerel:2|Piranha:2|Swordfish:1|Pufferfish:1
Name something that's orange.|Orange:42|Carrot:24|Pumpkin:10|Tiger:6|Goldfish:4|Basketball:3|Mango:3|Fire:2|Traffic cone/cone:2|Sunset:2|Fox:1
Name something that comes in pairs.|Socks:44|Shoes:22|Twins:8|Gloves:6|Earrings:6|Eyes:4|Chopsticks:3|Dice:2|Ears:2|Trousers/pants:1|Scissors:1|Glasses:1
What's the best sound?|Rain:24|Laughter/laughing:18|Waves/the sea/ocean:14|Birdsong/birds:10|Music:10|Silence:6|A baby laughing:4|Crackling fire/fire:4|Cat purring/purring:4|Ice cream van/ice cream truck:2|Applause:1|Doorbell:1
Name something in the sea.|Fish:42|Shark:18|Whale:10|Dolphin:8|Seaweed:5|Jellyfish:4|Octopus:3|Crab:3|Coral:2|Turtle:2|Boat:1|Shipwreck:1|Salt:1
Name a breakfast food.|Eggs:22|Toast:18|Cereal:16|Pancakes:10|Bacon:6|Porridge/oatmeal/oats:6|Fruit:4|Yogurt/yoghurt:4|Croissant:3|Waffles:2|Bread:2|Rice:2|Paratha:1|Idli/dosa:1|Congee:1
Name a car brand.|Toyota:18|Ford:16|BMW:12|Mercedes/mercedes-benz:10|Volkswagen/vw:8|Honda:8|Ferrari:6|Audi:5|Tesla:5|Nissan:3|Hyundai:3|Porsche:2|Kia:1|Tata:1|Lamborghini:1
Name something that flies.|Bird:46|Plane/aeroplane/airplane:30|Kite:5|Butterfly:4|Bee:3|Helicopter:3|Fly:2|Bat:2|Rocket:1|Superman:1|Drone:1|Dragon:1|Mosquito:1
Name an animal with stripes.|Zebra:52|Tiger:32|Bee:5|Skunk:2|Clownfish:2|Chipmunk:2|Wasp:2|Okapi:1|Snake:1|Lemur:1
Name something that's pink.|Flamingo:30|Pig:22|Candyfloss/cotton candy:10|Barbie:6|Rose:6|Bubblegum:6|Pink Panther:5|Cherry blossom:3|Shrimp/prawn:3|Lotus:2|Salmon:2|Tongue:2|Strawberry milkshake:2|Dragon fruit:1
Name a reason to celebrate.|Birthday:46|Wedding:14|New job:8|Graduation:8|New Year:6|Anniversary:4|New baby/baby:4|Promotion:3|Passing exams/exams:2|Christmas:2|Diwali:1|Eid:1|Retirement:1
Name a type of nut.|Peanut:34|Almond:16|Cashew:14|Walnut:10|Hazelnut:6|Pistachio:6|Coconut:4|Brazil nut:3|Macadamia:3|Pecan:3|Chestnut:1
Name a famous mountain.|Mount Everest/everest:54|Kilimanjaro:12|Mount Fuji/fuji:8|Mont Blanc:6|K2:6|Matterhorn:4|Ben Nevis:3|Table Mountain:2|Mount Olympus/olympus:2|Denali/mount mckinley:1|Mount Etna/etna:1|Snowdon:1
Name something that's spicy.|Chilli/chili/chilli pepper:40|Curry:18|Jalapeno:8|Wasabi:6|Hot sauce:6|Pepper:4|Ginger:4|Kimchi:3|Mustard:3|Salsa:3|Ghost pepper:2|Sriracha:2|Tabasco:1
Name something that makes you sneeze.|Pepper:36|Dust:22|Pollen/hay fever:16|A cold:6|Flowers:4|Cats:4|Sunlight/sun:3|Feather:3|Allergies:2|Perfume:2|Dog hair:1|Chilli/chili:1
What's the best way to cook an egg?|Fried:28|Scrambled:26|Boiled/soft boiled/hard boiled:24|Poached:10|Omelette/omelet:8|Sunny side up:2|Baked:1|Devilled/deviled:1
Name something that's green.|Grass:42|Frog:12|Leaves:10|Trees:6|Broccoli:6|Lime:4|Cucumber:3|Peas:3|Shrek:3|Kermit:3|Apple:2|Money/dollar:2|Avocado:2|Hulk:2
Name a type of weather.|Rain:36|Sun/sunny/sunshine:22|Snow:16|Wind/windy:8|Storm/thunderstorm:6|Cloudy/clouds:4|Fog:3|Hail:2|Lightning:1|Hurricane/typhoon/cyclone:1|Monsoon:1
Name an animal that lives in a zoo.|Lion:32|Elephant:18|Giraffe:14|Monkey:10|Tiger:8|Penguin:6|Zebra:4|Panda:3|Gorilla:2|Hippo:2|Bear:1
Name a sport you can do on your own.|Running/jogging:32|Swimming:24|Golf:12|Cycling:8|Weightlifting/gym:4|Yoga:4|Boxing:3|Skiing:3|Surfing:3|Skateboarding:2|Archery:2|Climbing:2
Name something that's hot.|Sun:44|Fire:18|Oven:8|Chilli/chili:6|Lava/volcano:6|Coffee:4|Desert:4|Summer:4|Stove:3|Kettle:2|Sauna:1
Name something that's in space.|Stars:40|Moon:18|Planets:14|Sun:6|Astronaut:6|Rocket:4|Aliens:4|Black hole:3|Satellite:2|Comet:1|Asteroid:1|Galaxy:1
Name a famous bridge.|Golden Gate Bridge/golden gate:40|Tower Bridge:24|London Bridge:10|Brooklyn Bridge:8|Sydney Harbour Bridge/sydney harbor bridge:6|Rialto Bridge/rialto:2|Ponte Vecchio:2|Charles Bridge:2|Howrah Bridge/howrah:2|Bridge of Sighs:2|Forth Bridge:1|Oresund Bridge:1
Name something that's soft.|Pillow:34|Teddy bear/teddy:14|Cotton wool/cotton balls/cotton:10|Feather:8|Blanket:8|Cloud:6|Kitten/cat:4|Marshmallow:4|Bed:4|Baby's skin/baby skin:3|Bread:2|Butter:2|Tofu:1
What's the scariest animal?|Shark:26|Spider:20|Snake:20|Crocodile/alligator:8|Lion:6|Bear:6|Tiger:4|Scorpion:3|Wolf:2|Mosquito:2|Hippo:2|Jellyfish:1
What's the best thing to dip in hummus?|Carrots/carrot sticks:34|Pita/pitta/pita bread:32|Tortilla chips/crisps/chips:8|Cucumber:6|Celery:6|Crackers:4|Peppers/bell peppers:3|Pretzels:3|Breadsticks:2|Falafel:1|Your finger/finger:1
Name an animal you might have as a pet.|Dog:46|Cat:30|Fish/goldfish:7|Hamster:5|Rabbit/bunny:5|Guinea pig:2|Bird/parrot/budgie:2|Snake:1|Tortoise/turtle:1|Horse:1
Name a dinosaur.|T-Rex/tyrannosaurus/tyrannosaurus rex:46|Velociraptor/raptor:12|Triceratops:12|Stegosaurus:10|Brachiosaurus:6|Diplodocus:4|Pterodactyl:4|Spinosaurus:2|Ankylosaurus:2|Barney:1|Dino:1
Name a famous video game.|Super Mario/mario:26|Minecraft:16|Tetris:10|Fortnite:10|Pac-Man/pacman:8|Call of Duty:8|FIFA/ea fc:6|Pokemon:5|Grand Theft Auto/gta:4|Sonic/sonic the hedgehog:3|Zelda/legend of zelda:2|Space Invaders:1|Candy Crush:1
Name a type of bread.|Naan:18|Baguette:16|Sourdough:12|Roti/chapati:10|Pita/pitta:10|Tortilla:8|White bread/white:6|Bagel:6|Croissant:4|Ciabatta:4|Focaccia:2|Brioche:2|Rye:1|Injera:1
Name a famous festival.|Christmas:28|Diwali:18|Chinese New Year/lunar new year:14|Halloween:10|Eid:8|Carnival/carnaval:6|Holi:6|Oktoberfest:3|Easter:2|Hanukkah:2|Thanksgiving:2|Day of the Dead/dia de los muertos:1
Name a famous landmark.|Eiffel Tower:30|Great Wall of China/great wall:12|Taj Mahal:12|Statue of Liberty:10|The Pyramids/pyramids of giza:10|Big Ben:6|Colosseum:6|Sydney Opera House:4|Christ the Redeemer:3|Machu Picchu:2|Burj Khalifa:2|Stonehenge:2|Petra:1
Name a country in Asia.|China:28|Japan:24|India:22|Thailand:6|South Korea/korea:6|Vietnam:4|Indonesia:3|Philippines:2|Malaysia:2|Singapore:1|Nepal:1|Pakistan:1
Name a country in Europe.|France:26|Spain:18|Germany:14|Italy:14|England/uk/united kingdom:8|Greece:4|Portugal:4|Netherlands/holland:3|Switzerland:3|Sweden:2|Ireland:2|Belgium:1|Poland:1
Name a country in South America.|Brazil:46|Argentina:20|Peru:8|Colombia:8|Chile:8|Venezuela:3|Ecuador:3|Bolivia:2|Paraguay:1|Uruguay:1
Name a rice dish.|Fried rice:22|Biryani:18|Paella:12|Risotto:12|Sushi:12|Jollof rice/jollof:6|Rice pudding:4|Pilaf/pilau:4|Rice and beans:4|Bibimbap:2|Congee:2|Nasi goreng:2
Name a street food.|Hot dog:16|Tacos:16|Kebab/doner:10|Samosa:8|Pizza:6|Burger:6|Dumplings:6|Pad thai:4|Crepes:4|Churros:4|Fries:4|Pani puri/golgappa:4|Falafel:4|Satay:2|Pretzel:2
Name a tropical fruit.|Mango:30|Pineapple:22|Banana:12|Coconut:10|Papaya:6|Passion fruit:4|Kiwi:4|Guava:3|Dragon fruit:3|Lychee:2|Durian:2|Jackfruit:2
Name a spice.|Pepper/black pepper:24|Cinnamon:18|Cumin:10|Turmeric:10|Paprika:8|Chilli powder/chili powder/chilli:6|Ginger:6|Nutmeg:4|Saffron:4|Cardamom:4|Garlic:2|Cloves:2|Oregano:2
Name a famous footballer (or soccer player).|Lionel Messi/messi:30|Cristiano Ronaldo/ronaldo/cr7:26|Pele:10|David Beckham/beckham:8|Diego Maradona/maradona:6|Kylian Mbappe/mbappe:5|Neymar:4|Zinedine Zidane/zidane:3|Mohamed Salah/salah:3|Erling Haaland/haaland:2|Ronaldinho:2|Harry Kane/kane:1
Name a famous athlete.|Usain Bolt/bolt:20|Lionel Messi/messi:14|Cristiano Ronaldo/ronaldo:12|Michael Jordan/jordan:10|Serena Williams/serena:8|Muhammad Ali/ali:8|LeBron James/lebron:6|Michael Phelps/phelps:6|Roger Federer/federer:6|Tiger Woods/tiger:4|Sachin Tendulkar/sachin:3|Simone Biles/biles:3
Name a famous singer.|Taylor Swift:18|Michael Jackson:14|Beyonce:12|Adele:8|Elvis Presley/elvis:6|Ed Sheeran:6|Rihanna:6|Madonna:5|Freddie Mercury:4|Shakira:4|Lady Gaga:4|Bruno Mars:3|Justin Bieber:3|Celine Dion:2|Bad Bunny:2
Name a famous film.|Titanic:26|Star Wars:12|The Lion King:8|Avatar:8|Harry Potter:8|Jurassic Park:6|The Godfather:6|The Avengers:6|Frozen:4|Jaws:4|E.T./et:3|Home Alone:3|Forrest Gump:3|Spirited Away:2|3 Idiots:1
Name a famous brand.|Apple:26|Nike:20|Coca-Cola/coke:18|Samsung:10|Google:6|Adidas:6|Amazon:5|McDonald's:4|Toyota:2|Gucci:1|Sony:1|Louis Vuitton:1
Name a language.|English:34|Spanish:20|French:14|Chinese/mandarin:12|Hindi:4|Arabic:4|German:4|Japanese:3|Portuguese:2|Italian:1|Russian:1|Korean:1
Name a musical instrument.|Piano:32|Guitar:30|Drums:12|Violin:10|Flute:4|Trumpet:4|Saxophone/sax:2|Sitar:2|Harp:1|Cello:1|Tabla:1|Ukulele:1
Name a part of the body.|Arm:16|Hand:14|Head:14|Leg:12|Eye:8|Nose:8|Heart:6|Foot:6|Finger:4|Mouth:4|Ear:4|Knee:2|Brain:1|Elbow:1
Name an insect.|Bee:26|Ant:22|Fly:12|Butterfly:10|Ladybird/ladybug:8|Mosquito:8|Spider:4|Beetle:4|Cockroach:2|Grasshopper:2|Dragonfly:1|Wasp:1
Name a vegetable.|Carrot:32|Broccoli:16|Potato:12|Peas:6|Cabbage:5|Tomato:5|Onion:4|Spinach:4|Cauliflower:3|Cucumber:3|Lettuce:3|Eggplant/aubergine/brinjal:2|Pepper:2|Corn:2|Okra:1
Name a wild animal you'd see in Africa.|Lion:40|Elephant:22|Giraffe:12|Zebra:8|Hippo/hippopotamus:5|Rhino/rhinoceros:4|Cheetah:3|Gorilla:2|Leopard:2|Crocodile:1|Hyena:1
Name a fruit.|Apple:30|Banana:22|Orange:12|Mango:10|Strawberry:8|Grapes:4|Pineapple:3|Watermelon:3|Pear:2|Peach:2|Kiwi:1|Cherry:1|Lychee:1|Papaya:1
Name a colour (or color).|Blue:32|Red:26|Green:12|Yellow:8|Purple:6|Black:4|Pink:4|Orange:3|White:2|Brown:1|Gold:1|Grey/gray:1
Name a noodle dish.|Ramen:26|Pad thai:18|Chow mein:14|Pho:8|Instant noodles/pot noodle/maggi:8|Udon:6|Spaghetti:6|Lo mein:4|Laksa:3|Soba:3|Singapore noodles:2|Hakka noodles:1|Dan dan noodles:1
Name something made of glass.|Window:36|Bottle:14|Mirror:12|Glasses/spectacles:8|Wine glass:6|Vase:6|Light bulb:4|Phone screen/screen:4|Jar:4|Marble:2|Windscreen/windshield:2|Lens:1|Ornament:1
Name something with wheels.|Car:40|Bike/bicycle:20|Bus:8|Skateboard:6|Truck/lorry:6|Train:4|Pram/stroller/buggy:3|Shopping trolley/shopping cart:3|Motorbike/motorcycle:3|Wheelchair:2|Suitcase:2|Rickshaw/tuk tuk:2|Roller skates:1
Name an animal that can swim.|Fish:26|Dolphin:16|Duck:10|Dog:8|Shark:8|Whale:6|Penguin:5|Seal:4|Turtle:4|Polar bear:3|Frog:3|Otter:3|Crocodile:2|Hippo:2
`

export type Region = 'shared' | 'world'
export interface Question extends Prompt {
  region: Region
}

function parse(raw: string, region: Region, start: number): Question[] {
  return raw
    .trim()
    .split('\n')
    .map((line, i) => {
      const [question, ...parts] = line.split('|')
      return {
        id: start + i,
        region,
        question: question!.trim(),
        answers: parts.map((part) => {
          const at = part.lastIndexOf(':')
          const [text, ...aliases] = part.slice(0, at).split('/')
          return { text: text!.trim(), aliases: aliases.map((a) => a.trim()), weight: Number(part.slice(at + 1)) }
        }),
      }
    })
}

const shared = parse(SHARED, 'shared', 0)
export const QUESTIONS: Question[] = [...shared, ...parse(WORLD, 'world', shared.length)]

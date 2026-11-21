/**
 * Herd Mentality prompts, with the answers a crowd actually gives and roughly how
 * often. The AI herd draws from these weights, so the most popular answer here is
 * usually the herd answer, and the 1s are where pink cows come from.
 *
 * One prompt per line:  Question|Answer/alias/alias:weight|Answer:weight|...
 * Aliases are other ways of saying the same answer ("loo" for "toilet"); matching
 * also forgives case, "the", plurals and small typos, so only list real alternatives.
 */
const RAW = `
Name a famous Steven.|Steven Spielberg/spielberg:30|Steve Jobs/jobs:24|Steven Gerrard/gerrard:14|Stephen King/king:10|Steve Irwin/irwin:7|Stephen Fry/fry:5|Steve Martin:4|Stephen Hawking/hawking:4|Steven Seagal:1|Steve Wozniak/wozniak:1
Chocolate: room temperature or cold?|Room temperature/room temp/warm:62|Cold/fridge/chilled:38
What is the worst vegetable?|Brussels sprouts/sprouts/sprout:46|Celery:10|Aubergine/eggplant:8|Beetroot:7|Mushroom:6|Cauliflower:5|Broccoli:4|Peas:3|Kale:3|Okra:2|Parsnip:1|Swede:1
Name a famous river.|Thames/river thames:32|Nile:26|Amazon:20|Mississippi:8|Danube:4|Seine:4|Severn:2|Rhine:2|Ganges:1|Mersey:1
Name a black and white animal.|Zebra:44|Panda:26|Penguin:16|Cow:7|Skunk:3|Badger:2|Orca/killer whale:1|Magpie:1
Would you rather meet your ancestors from the past or descendants in the future?|Descendants/future:57|Ancestors/past:43
Describe chocolate in one word.|Delicious:30|Yummy/yum:14|Sweet:12|Heavenly/heaven:8|Addictive:7|Creamy:6|Rich:6|Smooth:5|Naughty:4|Life:3|Happiness:2|Brown:1
What's the best greeting: handshake, high five or fist bump?|Handshake:41|High five:31|Fist bump:28
Name a type of whale.|Blue whale/blue:44|Killer whale/orca:24|Humpback/humpback whale:18|Sperm whale/sperm:7|Beluga:4|Narwhal:2|Minke:1
Does pineapple belong on pizza?|Yes:47|No:53
What's another name for a toilet?|Loo:48|Bathroom:12|Lavatory/lav:10|Bog:9|Toilet/wc:6|Throne:5|Restroom:4|Khazi:2|Dunny:1|Privy:1
You can take one item to a desert island. What is it?|Knife/penknife/swiss army knife:24|Phone/mobile:14|Book:10|Lighter/matches:10|Water:8|Boat:7|Rope:4|Tent:4|Hammock:3|Fishing rod:3|Guitar:2|Sunscreen:1|Satellite phone:1
Name something that falls from the sky.|Rain:56|Snow:16|Hail:6|Meteor/meteorite/asteroid:6|Bird poo/bird poop:5|Leaves:4|Plane:2|Cats and dogs:2|Raindrops:1|Frogs:1
Name a fruit that's red.|Strawberry:44|Apple:22|Cherry:16|Raspberry:10|Pomegranate:3|Watermelon:3|Tomato:1|Redcurrant:1
Name a famous wizard.|Harry Potter/harry:34|Gandalf:30|Dumbledore:12|Merlin:16|Voldemort:2|Rincewind:1|Paul Daniels:1
What's the best biscuit to dunk in tea?|Digestive/chocolate digestive:30|Rich Tea:28|Hobnob/hobnobs:16|Custard Cream:8|Ginger Nut:7|Bourbon:6|Jaffa Cake:2|Shortbread:1
Name a famous Beatle.|John Lennon/lennon/john:42|Paul McCartney/mccartney/paul:34|Ringo Starr/ringo:15|George Harrison/george/harrison:9
What's the best pizza topping?|Pepperoni:42|Cheese/extra cheese:12|Mushroom:11|Ham:9|Pineapple:7|Chicken:6|Olives:4|Jalapenos/jalapeno:4|Sausage:3|Anchovies:1|Spinach:1
Name a famous ship.|Titanic:62|Mary Rose:8|Cutty Sark:7|Mayflower:7|Queen Mary:5|Victory/hms victory:4|Black Pearl:3|Bismarck:2|Ark/noahs ark:1|Endeavour:1
Name something you take to the beach.|Towel:42|Sun cream/suncream/sunscreen:20|Bucket and spade/bucket/spade:12|Umbrella/parasol:8|Swimsuit/swimming costume:6|Sunglasses:4|Picnic:3|Book:2|Windbreak:2|Football:1
Name a breakfast cereal.|Cornflakes:30|Weetabix:22|Cheerios:12|Coco Pops:10|Rice Krispies:8|Shreddies:6|Frosties:6|Bran Flakes:3|Shredded Wheat:2|Muesli:1
What's the best day of the week?|Saturday:48|Friday:36|Sunday:12|Wednesday:2|Thursday:1|Monday:1
Name a colour of the rainbow.|Red:34|Blue:20|Green:14|Yellow:12|Orange:8|Purple:5|Violet:4|Indigo:3
Name a famous painter.|Picasso/pablo picasso:34|Van Gogh/vincent van gogh:30|Leonardo da Vinci/da vinci/leonardo:12|Monet:10|Michelangelo:4|Banksy:3|Rembrandt:3|Dali:2|Bob Ross:1|Warhol/andy warhol:1
Name a James Bond actor.|Sean Connery/connery:34|Daniel Craig/craig:30|Roger Moore/moore:16|Pierce Brosnan/brosnan:12|Timothy Dalton/dalton:4|George Lazenby/lazenby:3|David Niven:1
Name a sport played with a ball.|Football/soccer:52|Tennis:12|Rugby:10|Cricket:8|Basketball:7|Golf:5|Netball:2|Volleyball:2|Baseball:1|Snooker:1
Name a type of dog.|Labrador/lab:34|Poodle:12|Golden Retriever/retriever:10|Dachshund/sausage dog:9|Spaniel/cocker spaniel:8|Beagle:6|Pug:6|Bulldog:5|Chihuahua:5|Corgi:3|Dalmatian:1|Whippet:1
What's the best crisp flavour?|Salt and vinegar:34|Cheese and onion:30|Ready salted/plain:14|Prawn cocktail:8|Smoky bacon:6|Sour cream and chive:4|Roast chicken:2|Pickled onion:1|Worcester sauce:1
Name a famous Simpsons character.|Homer/homer simpson:46|Bart/bart simpson:28|Marge:8|Lisa:6|Mr Burns/burns:6|Ned Flanders/flanders:3|Krusty:2|Apu:1
Name a planet.|Mars:38|Jupiter:18|Saturn:14|Earth:10|Venus:8|Mercury:5|Neptune:3|Uranus:3|Pluto:1
Name a famous scientist.|Einstein/albert einstein:52|Newton/isaac newton:18|Stephen Hawking/hawking:10|Darwin/charles darwin:8|Marie Curie/curie:7|Tesla:3|Galileo:1|Brian Cox:1
Name a Christmas song.|All I Want for Christmas Is You/all i want for christmas:26|Last Christmas:20|Jingle Bells:14|Fairytale of New York:12|Silent Night:8|Merry Xmas Everybody:6|Driving Home for Christmas:5|White Christmas:5|Do They Know It's Christmas:2|Mistletoe and Wine:1|Stop the Cavalry:1
What's the best Christmas dinner trimming?|Pigs in blankets:48|Roast potatoes/roasties:20|Stuffing:12|Yorkshire pudding/yorkshires:6|Gravy:5|Cranberry sauce:4|Parsnips:3|Brussels sprouts/sprouts:1|Bread sauce:1
Name a famous Spice Girl.|Victoria/posh/posh spice:26|Geri/ginger/ginger spice:22|Mel B/scary/scary spice:18|Emma/baby/baby spice:18|Mel C/sporty/sporty spice:16
Name a London landmark.|Big Ben:40|Tower Bridge:16|London Eye:14|Buckingham Palace:12|Tower of London:6|St Paul's/st pauls cathedral:4|The Shard/shard:4|Nelson's Column:2|Trafalgar Square:1|Gherkin:1
What's the best flavour of ice cream?|Vanilla:28|Chocolate:26|Mint choc chip:14|Strawberry:12|Cookie dough:6|Salted caramel:6|Rum and raisin:3|Pistachio:3|Neapolitan:1|Bubblegum:1
Name a famous Bond villain.|Blofeld:42|Jaws:16|Goldfinger:14|Dr No:12|Oddjob:6|Scaramanga:4|Le Chiffre:3|Silva:2|Rosa Klebb:1
Name a type of cheese.|Cheddar:52|Brie:14|Stilton:8|Mozzarella:7|Camembert:6|Parmesan:4|Feta:3|Red Leicester:2|Wensleydale:2|Gouda:1|Halloumi:1
Name something you find in a garden.|Flowers/flower:34|Grass:18|Shed:12|Gnome/garden gnome:10|Worms/worm:6|Tree:6|Plants:5|Bench:3|Pond:2|Slug:2|Hose:1|Trampoline:1
Name a famous queen.|Elizabeth/queen elizabeth/elizabeth ii:58|Victoria/queen victoria:18|Cleopatra:8|Freddie Mercury/freddie:6|Boudicca:4|Beyonce:3|Mary/mary queen of scots:2|Latifah/queen latifah:1
Name a board game.|Monopoly:56|Scrabble:14|Cluedo:10|Chess:6|Snakes and ladders:4|Trivial Pursuit:4|Risk:2|Herd Mentality:2|Ludo:1|Pictionary:1
What's the best takeaway?|Chinese:30|Indian/curry:28|Pizza:16|Fish and chips/chippy:14|Kebab:5|Thai:3|Burger:2|Sushi:1|Mexican:1
Name a famous footballer.|David Beckham/beckham:30|Lionel Messi/messi:18|Cristiano Ronaldo/ronaldo:16|Harry Kane/kane:10|Pele:6|Wayne Rooney/rooney:6|Marcus Rashford/rashford:4|Gary Lineker/lineker:4|Paul Gascoigne/gazza:3|Maradona:2|Bukayo Saka/saka:1
Name a type of bird.|Robin:28|Pigeon:16|Eagle:12|Blackbird:7|Sparrow:7|Seagull/gull:6|Owl:6|Parrot:5|Crow:4|Penguin:3|Magpie:3|Puffin:1|Flamingo:1
Name a famous Disney film.|The Lion King/lion king:30|Frozen:22|Snow White:10|Aladdin:8|Toy Story:8|Beauty and the Beast:6|The Little Mermaid/little mermaid:5|Bambi:4|Cinderella:4|Fantasia:1|Moana:1|Dumbo:1
Name a sandwich filling.|Cheese:22|Ham:20|Tuna/tuna mayo:12|Egg mayo/egg:10|Chicken:8|BLT:7|Cheese and pickle:6|Prawn:5|Jam:3|Coronation chicken:3|Crisps:2|Fish fingers:1|Marmite:1
What's the best time to wake up on a weekend?|9am/9:40|10am/10:24|8am/8:16|11am/11:8|Midday/12/noon:5|7am/7:4|6am/6:2|Whenever:1
Name a famous horror film.|The Exorcist/exorcist:28|Halloween:16|Scream:12|The Shining/shining:12|It:10|A Nightmare on Elm Street/nightmare on elm street:8|Psycho:6|Saw:4|Jaws:2|The Ring:1|Get Out:1
Name a type of pasta.|Spaghetti:46|Penne:18|Fusilli:10|Lasagne/lasagna:8|Macaroni:6|Tagliatelle:5|Ravioli:3|Farfalle/bow ties:2|Linguine:1|Orzo:1
Name a famous magician.|David Copperfield/copperfield:26|Paul Daniels:22|Houdini/harry houdini:22|Dynamo:16|David Blaine/blaine:8|Penn and Teller/penn:4|Derren Brown:1|Tommy Cooper:1
Name a famous Muppet.|Kermit/kermit the frog:52|Miss Piggy/piggy:24|Animal:8|Gonzo:6|Fozzie/fozzie bear:5|Beaker:2|Statler and Waldorf/statler:2|Swedish Chef:1
Name something that's yellow.|Banana:42|Sun:26|Lemon:12|Cheese:5|Custard:4|Duck/rubber duck:3|Sunflower:3|Daffodil:2|Bee:1|Taxi:1|Minion:1
Name a dance.|Waltz:22|Tango:20|Salsa:14|Cha cha/cha cha cha:10|Macarena:8|Foxtrot:7|Conga:4|Ballet:4|Twist:3|Floss:2|Moonwalk:1|Charleston:1
Name a famous Harry.|Harry Potter/potter:32|Harry Styles/styles:26|Prince Harry:24|Harry Kane/kane:8|Harry Houdini/houdini:4|Harry Redknapp/redknapp:3|Harry Hill:2|Harry Enfield:1
Name a farm animal.|Cow:40|Pig:24|Sheep:18|Chicken/hen:8|Horse:5|Goat:3|Duck:1|Llama:1
What's the best sauce for chips?|Ketchup/tomato ketchup:48|Mayo/mayonnaise:18|Curry sauce:10|Gravy:8|Vinegar:6|Brown sauce:4|Garlic mayo:3|BBQ sauce:2|Salad cream:1
Name an Olympic sport.|Athletics/running:24|Swimming:22|Gymnastics:12|Rowing:8|Cycling:8|Boxing:6|Diving:5|Hockey:4|Archery:3|Fencing:3|Synchronised swimming:2|Curling:1|Breakdancing:1
Name a famous Bake Off judge.|Paul Hollywood/hollywood/paul:52|Mary Berry/mary:36|Prue Leith/prue:12
Name a word people say when they hurt themselves.|Ouch:46|Ow/oww:30|Ah/argh/aargh:6|Damn:5|Oof:4|Ooh:4|Crikey:2|Fiddlesticks:1|Bother:1
What do you call a baby cow?|Calf:96|Moo-calf:1|Heifer:2|Bullock:1
Name a famous Kardashian.|Kim/kim kardashian:66|Khloe:12|Kourtney:10|Kylie/kylie jenner:7|Kris/kris jenner:4|Rob:1
Name a hot drink.|Tea:52|Coffee:30|Hot chocolate:14|Cocoa:1|Bovril:1|Horlicks:1|Mulled wine:1
Name something people are scared of.|Spiders:42|Snakes:16|Heights:14|Clowns:8|The dark/dark:7|Death:4|Needles:3|Flying:2|Sharks:2|Moths:1|Pigeons:1
Name a type of shoe.|Trainers/sneakers:38|Boots/boot:16|High heels/heels:14|Sandals:10|Slippers:7|Flip flops:6|Brogues:3|Crocs:2|Loafers:2|Wellies/wellington boots:2|Clogs:1
Name a famous Doctor Who actor.|David Tennant/tennant:44|Matt Smith:14|Tom Baker:14|Jodie Whittaker/whittaker:8|Peter Capaldi/capaldi:7|Christopher Eccleston/eccleston:6|Ncuti Gatwa/gatwa:4|Jon Pertwee:2|Patrick Troughton:1
Name a gift you'd hate to receive.|Socks:44|Soap/toiletries:12|Underwear/pants:8|Gift card/voucher:6|Book:4|Calendar:4|Jumper/christmas jumper:6|Nothing:4|Tie:3|Candle:3|Coal:2|A lump of coal:1
Name something with a tail.|Dog:36|Cat:28|Monkey:8|Horse:6|Mouse:6|Kite:5|Comet:3|Plane:3|Fox:2|Tadpole:1|Pig:1|Squirrel:1
Name a superhero.|Batman:36|Superman:30|Spider-Man/spiderman:20|Iron Man/ironman:5|Wonder Woman:4|Hulk:2|Captain America:2|Thor:1
Name a famous cartoon dog.|Scooby-Doo/scooby/scooby doo:52|Snoopy:20|Pluto:10|Gromit:8|Odie:4|Brian/brian griffin:3|Santa's Little Helper:1|Goofy:1|Bluey:1
Name a party game.|Musical chairs:30|Charades:20|Pass the parcel:18|Twister:10|Musical statues:6|Pin the tail on the donkey:6|Truth or dare:4|Herd Mentality:3|Spin the bottle:2|Sardines:1
Name a pizza chain.|Domino's/dominos:40|Pizza Hut:36|Papa John's/papa johns:14|Pizza Express:8|Franco Manca:1|Little Caesars:1
Name something you do on a Sunday.|Sleep/lie in:24|Roast dinner/roast:22|Relax/chill:14|Church:10|Walk:8|Read the papers/newspaper:6|Football:4|Washing/laundry:4|Shopping:3|Ironing:2|Homework:1|Car boot sale:1
What's the best smell?|Fresh bread/bread:26|Coffee:16|Cut grass/freshly cut grass:14|Bacon:10|Rain/petrichor:8|Clean washing/laundry:8|Petrol:4|Baby:3|Popcorn:3|Vanilla:2|Sea air:1|New car:1|Bonfire:1
Name a famous tower.|Eiffel Tower/eiffel:56|Leaning Tower of Pisa/pisa/leaning tower:20|Blackpool Tower/blackpool:10|Tower of London:5|CN Tower:3|Big Ben:3|Burj Khalifa:2|Jenga tower:1
Name a type of hat.|Baseball cap/cap:30|Beanie/bobble hat/woolly hat:20|Top hat:12|Cowboy hat:10|Bowler hat/bowler:8|Sombrero:6|Fedora:5|Beret:3|Trilby:2|Fez:1|Deerstalker:1
Name something that's cold.|Ice:42|Snow:18|Fridge:8|Freezer:6|Ice cream:6|Antarctica/north pole/south pole:6|Winter:4|My feet/feet:3|Penguin:2|Ex:1|Nose:1
Name a famous palace.|Buckingham Palace/buckingham:58|Versailles/palace of versailles:18|Kensington Palace:8|Hampton Court:6|Blenheim Palace/blenheim:4|Crystal Palace:3|Windsor/windsor castle:2|Holyrood:1
Name a reason to be late for work.|Traffic:38|Overslept/slept in/alarm:28|Train delayed/train:12|Car broke down/car:8|Kids/children:5|Doctor's appointment/doctor:3|Weather:2|Dog ate my homework:2|Hangover:1|Couldn't find keys/keys:1
Name a famous wrestler.|Hulk Hogan/hogan:32|The Rock/rock/dwayne johnson:30|John Cena/cena:14|Big Daddy:8|Stone Cold/stone cold steve austin:6|Giant Haystacks/haystacks:4|Undertaker:4|Randy Savage:1|Macho Man:1
Name a popular baby name.|Olivia:16|Oliver:14|Noah:10|Amelia:10|George:8|Muhammad/mohammed:8|Jack:8|Charlotte:6|Isla:6|Harry:6|Lily:4|Arthur:3|Grace:1
Name something you'd find in a kitchen drawer.|Cutlery:24|Knife/knives:18|Spoon/spoons:10|Tea towel/tea towels:10|Batteries:8|Scissors:8|Takeaway menus/menus:6|Elastic bands/rubber bands:5|Foil:4|Corkscrew:3|String:2|Sellotape:1|Keys:1
What's the best season?|Summer:52|Autumn/fall:24|Spring:18|Winter:6
Name a famous Stephen or Steve from TV.|Stephen Fry/fry:30|Steve Coogan/coogan:16|Stephen Merchant/merchant:14|Steve Irwin/irwin:14|Stephen Mulhern/mulhern:12|Steve Wright:6|Stephen Colbert/colbert:6|Steve Backshall:2
Name a country in Africa.|Egypt:30|South Africa:24|Kenya:14|Nigeria:10|Morocco:8|Ghana:5|Ethiopia:3|Tanzania:2|Madagascar:2|Zambia:1|Chad:1
Name a famous Italian.|Leonardo da Vinci/da vinci/leonardo:22|Julius Caesar/caesar:12|Luciano Pavarotti/pavarotti:14|Michelangelo:10|Mussolini:6|Gino D'Acampo/gino:10|Sophia Loren/loren:6|Galileo:4|Mario:5|Valentino Rossi/rossi:2|Marco Polo:1
Name a TV detective.|Sherlock Holmes/sherlock/holmes:38|Columbo:16|Poirot/hercule poirot:14|Miss Marple/marple:8|Inspector Morse/morse:7|Luther:6|Vera:4|Frost/jack frost:3|Taggart:2|Bergerac:1|Scooby-Doo:1
Name a Greek god.|Zeus:52|Poseidon:14|Apollo:10|Hades:8|Aphrodite:6|Athena:4|Hermes:3|Ares:2|Dionysus:1
Name something people collect.|Stamps:38|Coins:22|Stickers:8|Football cards/trading cards/pokemon cards:8|Shells:5|Records/vinyl:5|Fridge magnets/magnets:4|Teddy bears:2|Thimbles:2|Dust:1|Spoons:1|Grudges:1
Name a type of tree.|Oak:54|Pine:12|Birch/silver birch:8|Willow/weeping willow:8|Apple:5|Christmas tree:4|Palm:3|Sycamore:2|Beech:2|Yew:1|Monkey puzzle:1
Name a famous cat.|Garfield:36|Tom/tom and jerry:22|The Cat in the Hat/cat in the hat:10|Sylvester:10|Postman Pat's cat/jess:6|Felix:5|Grumpy Cat:4|Larry/larry the cat:3|Puss in Boots:2|Bagpuss:1|Salem:1
What's the worst chore?|Ironing:38|Cleaning the toilet/toilet:18|Washing up/dishes:16|Hoovering/vacuuming:8|Cleaning the oven/oven:8|Bins/taking out the bins:4|Dusting:3|Laundry:2|Gardening:1|Windows:1
Name a type of sandwich bread.|White:44|Brown/wholemeal:26|Granary/seeded:8|Sourdough:7|Bagel:4|Baguette:4|Rye:2|Ciabatta:2|Pitta:1|Wrap:1
Name a word that rhymes with 'cat'.|Hat:34|Bat:24|Mat:18|Rat:10|Sat:6|Fat:4|Pat:2|Splat:1|Chat:1
Name something you can't live without.|Phone:42|Water:16|Coffee:10|Family:8|Food:6|Tea:5|Internet/wifi:5|Chocolate:3|Sleep:2|Dog:2|Glasses:1
Name a children's TV show.|Teletubbies:20|Peppa Pig/peppa:20|Blue Peter:14|Bluey:10|Sesame Street:8|In the Night Garden:6|Thomas the Tank Engine/thomas:6|Bob the Builder:5|Postman Pat:4|Rainbow:4|Fireman Sam:2|Mr Benn:1
What's the best cocktail?|Mojito:28|Pina colada:16|Cosmopolitan/cosmo:10|Pornstar martini:12|Margarita:10|Espresso martini:10|Long Island iced tea:4|Sex on the beach:4|Daiquiri:3|Bloody Mary:2|Negroni:1
Name a famous racehorse.|Red Rum:52|Shergar:16|Desert Orchid:8|Frankel:8|Seabiscuit:6|Arkle:4|Best Mate:2|Tiger Roll:2|Black Beauty:1|Black Caviar:1
Name a famous tennis player.|Roger Federer/federer:28|Andy Murray/murray:24|Serena Williams/serena:16|Rafael Nadal/nadal:10|Novak Djokovic/djokovic:8|Emma Raducanu/raducanu:6|Tim Henman/henman:4|John McEnroe/mcenroe:2|Bjorn Borg:1|Venus Williams:1
Name a famous Elvis song.|Hound Dog:28|Suspicious Minds:16|Jailhouse Rock:14|Can't Help Falling in Love:12|Blue Suede Shoes:10|Love Me Tender:8|Heartbreak Hotel:4|A Little Less Conversation:4|Return to Sender:2|Burning Love:1|In the Ghetto:1
Name a famous ventriloquist's dummy.|Lord Charles:28|Orville:34|Nookie Bear:8|Emu:10|Gordon the Gopher:6|Keith Harris:4|Sooty:6|Chucky:2|Slappy:1|Hacker:1
Name something that's sticky.|Glue:34|Honey:24|Sellotape/tape:12|Jam:8|Toffee:6|Syrup/golden syrup:5|Chewing gum/gum:5|Candyfloss:2|Slime:2|Sap:1|Treacle:1
Name a famous scientist from TV.|Brian Cox/professor brian cox:46|David Attenborough/attenborough:24|Bill Nye:10|Patrick Moore/patrick moore:8|Robert Winston/lord winston:4|Hannah Fry:4|Dr Who:2|Maggie Aderin-Pocock:1|Magnus Pyke:1
What's the best thing about Christmas?|Presents/gifts:40|Food/dinner:22|Family:20|Time off/holidays:8|Christmas dinner:4|Decorations:2|Snow:2|Crackers:1|The Queen's speech/king's speech:1
Name a famous Ford car.|Fiesta:42|Focus:22|Mustang:12|Escort:8|Capri:7|Model T:4|Mondeo:3|Transit:1|Sierra:1
What's the worst job?|Toilet cleaner/cleaning toilets:28|Bin man/refuse collector:16|Sewer worker/sewers:14|Call centre:8|Undertaker:6|Traffic warden:6|Politician:6|Teacher:3|Sales:2|Taxman:1|Dentist:1
Name a reason you'd call in sick.|Flu:26|Cold:20|Food poisoning:12|Headache/migraine:10|Hangover:8|Stomach bug/sickness bug/bug:10|Covid:6|Back pain:3|Mental health day:2|Too tired:1|It's sunny:1
Name something that's round.|Ball:46|Circle:12|Moon:8|Earth/globe:8|Plate:6|Clock:5|Wheel:4|Coin:4|Pizza:3|Orange:2|Bubble:1|Donut:1
Name a sweet that comes in a packet.|Haribo/tangfastics:24|Skittles:14|Wine gums:12|Jelly babies:12|Starburst:8|Fruit pastilles:8|Maltesers:6|M&Ms:6|Polos:4|Jelly beans:3|Refreshers:1|Love hearts:1
Name something you'd take on a picnic.|Sandwiches/sandwich:42|Blanket/rug:22|Basket/picnic basket:8|Crisps:6|Drinks:5|Cake:4|Scotch eggs:4|Fruit:3|Strawberries:2|Wasps:1|Frisbee:1
Name a famous Bond girl.|Honey Ryder/ursula andress:28|Pussy Galore:18|Vesper Lynd/vesper:12|Xenia Onatopp:8|Jinx:8|Holly Goodhead:6|Solitaire:6|Tiffany Case:4|Octopussy:4|Madeleine Swann:1
Name a type of potato dish.|Chips/fries:34|Mash/mashed potato:24|Roast potatoes/roasties:16|Jacket potato/baked potato:10|Hash browns:6|Wedges:4|Dauphinoise:3|Croquettes:2|Rosti:1
Name something you find at a funfair.|Dodgems/bumper cars:22|Ferris wheel/big wheel:20|Candyfloss:20|Rollercoaster:12|Waltzers:8|Carousel/merry go round:6|Hook a duck:6|Coconut shy:3|Ghost train:2|Toffee apple:1
Name a famous TV chef.|Gordon Ramsay/ramsay:38|Jamie Oliver/jamie:30|Nigella Lawson/nigella:12|Delia Smith/delia:6|Heston Blumenthal/heston:4|Mary Berry:4|Rick Stein:3|Ainsley Harriott:2|Keith Floyd:1
Name a famous Prime Minister.|Winston Churchill/churchill:42|Margaret Thatcher/thatcher:22|Tony Blair/blair:12|Boris Johnson/boris:12|Keir Starmer/starmer:4|Theresa May/may:3|Liz Truss/truss:3|David Cameron/cameron:1|Gordon Brown:1
Name something people do on a first date.|Dinner/meal:46|Drinks/pub:22|Cinema/film/movie:16|Walk:6|Coffee:5|Bowling:3|Mini golf:1|Picnic:1
Name a type of fish.|Cod:38|Salmon:22|Tuna:10|Haddock:10|Goldfish:6|Trout:4|Shark:3|Mackerel:3|Plaice:2|Clownfish/nemo:1|Piranha:1
What's the best thing to put on toast?|Butter:36|Jam:18|Beans/baked beans:14|Marmite:10|Peanut butter:8|Avocado:5|Cheese:4|Nutella:3|Eggs:1|Honey:1
Name a famous Agatha Christie detective.|Poirot/hercule poirot:62|Miss Marple/marple:36|Tommy and Tuppence:2
What's the worst sound?|Nails on a chalkboard/nails on a blackboard:38|Alarm clock/alarm:18|Snoring:10|Baby crying/crying baby:8|Chewing:8|Dentist drill/drill:6|Screaming:4|Car alarm:3|Mosquito:2|Silence:1|Vuvuzela:1
Name a famous Australian.|Steve Irwin/irwin:28|Kylie Minogue/kylie:26|Hugh Jackman/jackman:14|Crocodile Dundee:6|Chris Hemsworth/hemsworth:6|Nicole Kidman/kidman:6|Margot Robbie:6|Rolf Harris:2|Dame Edna/edna everage:1|Shane Warne:1
Name something that's orange.|Orange:44|Carrot:26|Pumpkin:10|Satsuma/tangerine/clementine:6|Fanta:4|Traffic cone/cone:3|Goldfish:2|Tango:2|Basketball:1|Jaffa cake:1|Space hopper:1
Name a famous Simon.|Simon Cowell/cowell:68|Simon Pegg/pegg:12|Simon Le Bon/le bon:6|Simon & Garfunkel/simon and garfunkel:6|Simon Amstell:2|Simon Mayo:2|Simple Simon:1|Simon Bird:1
Name a game you play at a sleepover.|Truth or dare:44|Spin the bottle:10|Charades:8|Monopoly:6|Twister:6|Would you rather:12|Hide and seek:6|Ouija board:3|Pillow fight:1
Name something that comes in pairs.|Socks:46|Shoes:22|Twins:8|Gloves:6|Earrings:6|Eyes:4|Chopsticks:3|Dice:2|Twix:1|Salt and pepper:1
Name a famous Michael.|Michael Jackson/jackson:58|Michael Jordan/jordan:12|Michael McIntyre/mcintyre:10|Michael Caine/caine:8|Michael Bublé/buble:4|Michael Owen:3|Michael Schumacher:3|Michael Palin:1|Michael Flatley:1
What's the best sound?|Rain:26|Laughter/laughing:18|Waves/the sea:14|Birdsong/birds:12|Music:10|Silence:6|Ice cream van:4|Cat purring/purring:4|Kettle boiling:2|Champagne cork:1
Name a famous Gary.|Gary Lineker/lineker:56|Gary Barlow/barlow:28|Gary Oldman/oldman:6|Gary Neville/neville:6|Gary Glitter:2|Gary Numan:1|Gary Wilmot:1
What do you call a group of crows?|Murder:76|Flock:18|Gang:3|Parliament:2|Mob:1
Name a famous Sarah.|Sarah Jessica Parker/sjp:44|Sarah Millican/millican:16|Sarah Ferguson/fergie:12|Sarah Lancashire:8|Sarah Harding:6|Sarah Beeny:6|Sarah Connor:4|Sarah Michelle Gellar/gellar:3|Sarah Kennedy:1
What's the worst thing to step on barefoot?|Lego:68|Plug:14|Pin/drawing pin:6|Glass:5|Slug:4|Snail:2|Dog poo/poo:1
Name something in the sea.|Fish:44|Shark:18|Whale:10|Dolphin:8|Jellyfish:6|Crab:4|Seaweed:3|Octopus:3|Starfish:2|Plastic:1|Mermaid:1
Name a breakfast food.|Toast:26|Cereal:22|Bacon:14|Eggs:12|Porridge:8|Full English/fry up:6|Pancakes:4|Croissant:3|Sausages:2|Kippers:1|Beans:1|Yoghurt:1
Name a type of bean.|Baked beans/baked:36|Kidney bean/kidney:18|Green beans/green:12|Broad bean/broad:8|Runner bean/runner:7|Butter bean/butter:5|Coffee bean/coffee:4|Chickpeas:3|Jelly bean:2|Mr Bean:2|Black bean:1|Edamame:1
Name a famous tennis tournament.|Wimbledon:82|US Open:8|French Open/roland garros:6|Australian Open:3|Queens:1
Name a fictional bear.|Winnie the Pooh/pooh:44|Paddington:38|Baloo:6|Yogi Bear/yogi:6|Rupert Bear/rupert:4|Fozzie:1|Bungle:1
Name a type of cake.|Chocolate cake/chocolate:36|Victoria sponge:24|Carrot cake/carrot:14|Red velvet:6|Lemon drizzle:8|Cheesecake:5|Fruit cake:3|Black Forest gateau:2|Battenberg:1|Swiss roll:1
Name something you'd find in a handbag.|Purse/wallet:30|Lipstick/makeup:18|Keys:16|Phone:14|Tissues:8|Hairbrush:3|Mints/chewing gum:4|Receipts:3|Hand sanitiser:2|Tampons:1|Snacks:1
Name a famous Robbie.|Robbie Williams:76|Robbie Coltrane/coltrane:10|Robbie Fowler/fowler:6|Robbie Savage:4|Robbie Keane:2|Robbie Rotten:1|Robbie Burns:1
Name a fictional pig.|Peppa Pig/peppa:46|Miss Piggy/piggy:18|Babe:16|Wilbur:6|Napoleon:4|Pumbaa:4|Piglet:4|Porky Pig:2|Percy Pig:1|Hamm:1
Name a type of car.|Ford:26|BMW:16|Volkswagen/vw:12|Mercedes:10|Audi:8|Toyota:7|Ferrari:6|Mini:5|Vauxhall:4|Tesla:3|Fiat:2|Reliant Robin:1
Name something that flies.|Bird:48|Plane/aeroplane:30|Kite:6|Bee:4|Butterfly:4|Helicopter:3|Fly:2|Bat:1|Pig:1|Time:1
Name an animal with stripes.|Zebra:56|Tiger:34|Bee:4|Skunk:2|Badger:2|Raccoon:1|Okapi:1
Name a famous festival.|Glastonbury:68|Reading/reading festival:10|Coachella:8|Notting Hill Carnival:6|Download:3|Isle of Wight:2|Burning Man:1|Edinburgh Fringe:1|Diwali:1
Name a famous Jack.|Jack Nicholson/nicholson:18|Jack Black:16|Jack Sparrow:14|Jack Whitehall/whitehall:14|Jack Grealish/grealish:10|Jack the Ripper:8|Jack Frost:6|Jack Russell:4|Jack and Jill:2|Jack Dee:2|Jack Charlton:1|Jack Kerouac:1
Name something that's pink.|Flamingo:32|Pig:22|Candyfloss:12|Barbie:8|Pink Panther:6|Flowers:4|Bubblegum:4|Salmon:3|Peppa Pig:3|Pink cow:2|Strawberry milkshake:2|Blossom:1|Ham:1
What's the best excuse for not doing homework?|The dog ate it/dog ate it:58|I forgot/forgot:16|Left it at home:12|I was ill/ill:6|Computer crashed:4|Didn't understand it:3|Gran's funeral:1
Name a famous ballet.|Swan Lake:62|The Nutcracker/nutcracker:28|Romeo and Juliet:4|Giselle:2|Sleeping Beauty:2|Billy Elliot:1|Coppelia:1
What's the best colour for a car?|Black:34|Red:22|White:14|Blue:12|Silver/grey:10|Green:4|Yellow:2|Orange:1|Purple:1
Name a famous Charles.|King Charles/prince charles:52|Charles Darwin/darwin:20|Charles Dickens/dickens:16|Charlie Chaplin/chaplin:6|Ray Charles:4|Charles Manson:1|Charles Xavier:1
Name something you'd see at a wedding.|Bride:30|Cake/wedding cake:22|Dress/wedding dress:14|Rings:10|Flowers/bouquet:8|Confetti:6|Vicar/priest:4|Drunk uncle:3|Dancing:2|Tears:1
Name a famous mouse.|Mickey Mouse/mickey:66|Jerry:14|Minnie Mouse/minnie:6|Stuart Little:6|Speedy Gonzales:2|Danger Mouse:3|Angelina Ballerina:1|Remy:1|Roland Rat:1
What's the most annoying habit?|Chewing loudly/loud chewing/chewing:30|Being late/lateness:14|Nail biting/biting nails:12|Snoring:10|Talking with mouth full:8|Interrupting:8|Sniffing:6|Tapping:4|Leaving the toilet seat up/toilet seat:4|Knuckle cracking:2|Humming:1
Name a famous Scottish person.|Billy Connolly/connolly:20|Sean Connery/connery:20|Andy Murray/murray:14|Robert Burns/rabbie burns/burns:12|Lewis Capaldi/capaldi:10|Gerard Butler:6|Susan Boyle/susan boyle:6|Rod Stewart:4|Kevin Bridges:3|Nicola Sturgeon/sturgeon:3|Braveheart/william wallace:1|Lulu:1
Name a famous Welsh person.|Tom Jones:42|Catherine Zeta-Jones/catherine zeta jones:12|Gareth Bale/bale:12|Anthony Hopkins/hopkins:8|Charlotte Church:6|Rob Brydon/brydon:6|Shirley Bassey:6|Dylan Thomas:4|Michael Sheen/sheen:2|Gavin and Stacey:1|Ryan Giggs:1
Name a famous Irish person.|Graham Norton/norton:24|Bono:20|Conor McGregor/mcgregor:12|Dermot O'Leary:8|Saoirse Ronan:6|Liam Neeson/neeson:10|Paul Mescal/mescal:6|Niall Horan/niall:6|Dara O Briain:4|Saint Patrick/st patrick:2|Mrs Brown:1|Enya:1
Name something you'd find at the seaside.|Sand:28|Sea:18|Seagull/seagulls:12|Shells:10|Ice cream:8|Pier:6|Deckchair:5|Donkey:4|Fish and chips:4|Arcade:2|Rock:1|Crab:1
Name a reason to celebrate.|Birthday:48|Wedding:14|New job:10|Christmas:8|Promotion:6|Passing exams/exams:5|New baby/baby:4|Anniversary:3|Friday:1|Payday:1
What's the best snack?|Crisps:36|Chocolate:30|Popcorn:8|Biscuits:8|Fruit/apple:6|Nuts:4|Cheese:3|Sweets:2|Pork scratchings:1|Toast:1|Hummus:1
Name a famous Bob.|Bob Marley/marley:36|Bob the Builder:22|Bob Dylan/dylan:16|Bob Geldof/geldof:10|Bob Ross:6|Bob Mortimer/mortimer:6|Bob Hoskins:2|SpongeBob:1|Bob Monkhouse:1
Name a type of hairstyle.|Bob:24|Ponytail:20|Mullet:14|Plait/braid/braids:10|Bun:8|Mohican/mohawk:8|Afro:4|Quiff:4|Pixie cut:3|Buzz cut:2|Beehive:1|Rachel:1
Name a fictional detective dog.|Scooby-Doo/scooby/scooby doo:84|Gromit:6|Snowy:6|McGruff:2|Bluey:1|Dougal:1
Name a part of the body you can't see without a mirror.|Back:42|Face:16|Ears:8|Bum/bottom:10|Neck:8|Eyes:6|Back of your head/back of head:6|Nose:2|Elbow:1|Tonsils:1
What's the best thing to do on a rainy day?|Watch a film/film/movie:36|Read/read a book:16|Sleep/nap:12|Board games/play games:12|Netflix/tv:10|Bake:6|Puddle jumping/jump in puddles:4|Go shopping:2|Video games:1|Nothing:1
Name a famous Lewis.|Lewis Hamilton/hamilton:66|Lewis Capaldi/capaldi:20|Lewis Carroll/carroll:8|Huey Lewis:2|Leona Lewis:2|Jerry Lewis:1|Lewis Collins:1
Name something you'd take on a long car journey.|Snacks/food:36|Music:16|Water/drinks:12|Phone:8|Pillow:6|Sweets:6|Map/satnav:5|Games/i spy:4|Book:2|Sick bag:1
Name a type of nut.|Peanut:38|Almond:16|Cashew:14|Walnut:10|Hazelnut:8|Brazil nut/brazil:6|Pistachio:4|Coconut:2|Macadamia:1|Pecan:1
Name a famous mountain.|Everest/mount everest:66|Ben Nevis:14|Snowdon/yr wyddfa:6|Kilimanjaro:6|K2:3|Matterhorn:2|Mont Blanc:2|Mount Fuji/fuji:1
Name something that's spicy.|Chilli/chili:46|Curry:18|Jalapeno:8|Pepper:8|Mustard:6|Wasabi:6|Hot sauce:4|Ginger:2|Salsa:1|Horseradish:1
Name a famous Elizabeth.|Queen Elizabeth/the queen:66|Elizabeth Taylor/liz taylor:12|Elizabeth Hurley/liz hurley:10|Elizabeth Bennet:4|Elizabeth Swann:4|Elizabeth Holmes:2|Elizabeth Fry:1|Elizabeth Olsen:1
Name something that makes you sneeze.|Pepper:38|Dust:22|Pollen/hay fever:16|Cold/a cold:8|Cats:6|The sun/sun:4|Flowers:4|Feathers:1|Perfume:1
Name a famous puppet.|Kermit:24|Sooty:20|Basil Brush:16|Pinocchio:12|Punch and Judy/mr punch:8|Gordon the Gopher:6|Zippy:6|Spitting Image:4|Orville:2|Lamb Chop:1|Rosie and Jim:1
What's the best way to cook an egg?|Fried:28|Scrambled:28|Boiled/soft boiled/dippy egg:24|Poached:14|Omelette:6
Name a famous Taylor.|Taylor Swift/swift:74|Elizabeth Taylor:10|Roger Taylor:6|Taylor Lautner:4|James Taylor:2|Phil Taylor/the power:2|Ellie Taylor:1|Taylor Hawkins:1
Name a famous Lord of the Rings character.|Gandalf:36|Frodo:28|Gollum:16|Aragorn:6|Legolas:6|Sam/samwise:4|Bilbo:2|Sauron:1|Treebeard:1
Name something that's green.|Grass:44|Frog:12|Leaves/leaf:10|Shrek:8|Broccoli:6|Peas:5|Kermit:4|Money:3|Cucumber:3|Lime:2|Envy:1|Hulk:1
Name a famous cowboy.|John Wayne/wayne:38|Woody:18|Clint Eastwood/eastwood:16|Billy the Kid:10|Buffalo Bill:6|Wild Bill Hickok:3|Doc Holliday:3|Lone Ranger:3|Wyatt Earp:2|Butch Cassidy:1
Name a type of weather.|Rain:36|Sun/sunny:22|Snow:16|Wind/windy:8|Cloudy/cloud:6|Fog:4|Thunder/storm/thunderstorm:4|Hail:2|Drizzle:1|Hurricane:1
Name a famous ghost.|Casper:50|Bloody Mary:8|Slimer:6|Nearly Headless Nick:8|Ghost of Christmas Past:6|Moaning Myrtle:6|Anne Boleyn:6|The Grey Lady:3|Banquo:2|Patrick Swayze:1
Name a fictional school.|Hogwarts:72|Grange Hill:10|St Trinian's:8|Bayside High:3|Waterloo Road:3|Malory Towers:2|Sunnydale:1|Springfield Elementary:1
Name something you can't do with your eyes open.|Sneeze:64|Sleep:24|Blink:6|Wink:4|Dream:1|Kiss:1
Name something people forget.|Keys:28|Birthdays/birthday:18|Names:16|Passwords/password:12|Phone:8|Anniversary:6|Glasses:4|Umbrella:3|Wallet:2|PIN:2|Why they came into the room:1
Name a famous Mark.|Mark Zuckerberg/zuckerberg:30|Mark Wahlberg/wahlberg:22|Mark Twain/twain:10|Mark Ruffalo/ruffalo:10|Mark Owen:8|Mark Hamill/hamill:6|Mark Wright:6|Mark Ronson:4|Marks and Spencer:2|Mark Kermode:1|Mark Webber:1
Name a famous Matt.|Matt Damon/damon:42|Matt Smith:14|Matt LeBlanc/leblanc:14|Matt Lucas/lucas:12|Matt Hancock/hancock:6|Matt Baker:6|Matthew Perry:4|Matt Groening:1|Matt Healy:1
What's the best gift to receive?|Money/cash:30|Chocolate:14|Jewellery:12|A holiday/holiday:12|Perfume/aftershave:8|Gift card/voucher:6|Flowers:6|Experience:4|Clothes:4|Book:2|Puppy:1|Socks:1
Name a famous horse.|Black Beauty:32|Red Rum:22|Shadowfax:8|Trigger:6|Seabiscuit:6|Champion the Wonder Horse:6|Shergar:6|Boxer:4|Spirit:4|Joey/war horse:3|Pegasus:2|Silver:1
Name a famous Chris.|Chris Hemsworth/hemsworth:26|Chris Evans:22|Chris Martin:12|Chris Pratt/pratt:12|Chris Moyles/moyles:8|Chris Packham/packham:6|Chris Rock:6|Chris Tarrant:4|Christopher Columbus:2|Christopher Robin:1|Chris Hoy:1
Name something that makes you cry.|Sad film/film:30|Onions/chopping onions:20|Breakup/heartbreak:12|Pain/hurt:10|Death/funeral:10|Happy/happiness:8|Wedding:4|Laughing:3|Eurovision:1|Stubbed toe:1|John Lewis advert:1
Name a famous Tom.|Tom Cruise/cruise:30|Tom Hanks/hanks:28|Tom Jones:14|Tom Holland:10|Tom Hardy:8|Tom Daley/daley:6|Tom and Jerry:2|Tom Kerridge:1|Tom Thumb:1
What's the best board game piece in Monopoly?|Dog/scottie dog:34|Car/racing car:24|Top hat/hat:14|Boot:6|Iron:6|Battleship/ship:6|Thimble:6|Cat:2|Wheelbarrow:1|Penguin:1
Name a fairy tale.|Cinderella:28|Snow White:18|Little Red Riding Hood/red riding hood:16|Hansel and Gretel:10|Goldilocks:8|Rapunzel:6|Sleeping Beauty:6|Jack and the Beanstalk:4|Three Little Pigs:2|Rumpelstiltskin:1|The Elves and the Shoemaker:1
Name something you'd find in a shed.|Spider/spiders:28|Lawnmower/mower:20|Tools:18|Bike:8|Spade/shovel:8|Paint:4|Plant pots:3|Hammer:3|Paddling pool:2|Dad:1|Junk:1
What's the best thing to dip in hummus?|Carrot/carrots/carrot sticks:36|Pitta bread/pitta:32|Crisps:8|Breadsticks:6|Celery:6|Cucumber:4|Peppers:4|Doritos:2|Chips:1|Fingers:1
Name a famous Ellie or Ella.|Ellie Goulding/goulding:40|Ella Fitzgerald/fitzgerald:22|Ella Henderson:12|Ellie Simmonds:10|Elle Macpherson:6|Ellie Taylor:4|Ellie Kemper:2|Ella Eyre:2|Ella Enchanted:1|Elle Woods:1
Name something you'd find in a school.|Teacher/teachers:34|Desk/desks:16|Whiteboard/blackboard/board:12|Books:10|Pupils/students/children:10|Pencil/pen:6|Lockers:4|Bell:3|Head teacher:2|Detention:1|Dinner lady:1|Chewing gum:1
Name a famous Simon Cowell show.|The X Factor/x factor:56|Britain's Got Talent/bgt:34|American Idol:6|Pop Idol:3|The Cube:1
Name a type of sauce.|Ketchup/tomato sauce:34|Brown sauce:14|Mayo/mayonnaise:12|Gravy:10|BBQ sauce/barbecue:8|Soy sauce/soy:6|Mint sauce:4|Hot sauce:4|Bolognese:3|Pesto:2|Hollandaise:1|Worcestershire:1
What do you shout on a rollercoaster?|Aaargh/argh/ahh:38|Wheee/whee:24|Help:12|Oh my god/omg:10|Woo/woohoo:8|Let me off:4|Mum:2|Faster:1|Nothing:1
Name a famous Rebecca or Becky.|Becky Hill:30|Rebecca Adlington/adlington:20|Rebecca Ferguson:16|Becky Lynch:6|Rebecca Loos:6|Becky Sharp:6|Rebecca Front:4|Rebecca Black:6|Becky with the good hair:1|Rebecca Lucy Taylor:1
Name an animal that lives in a zoo.|Lion:34|Elephant:18|Giraffe:14|Monkey:12|Penguin:8|Tiger:6|Zebra:4|Gorilla:2|Meerkat:1|Panda:1
Name a famous Mary.|Mary Berry/berry:34|Mary Poppins/poppins:26|Virgin Mary/mary:12|Mary Queen of Scots:10|Mary Portas/portas:6|Mary Shelley/shelley:4|Bloody Mary:4|Mary Whitehouse:2|Mary J Blige:1|Mary Beard:1
Would you rather be invisible or be able to fly?|Fly/flying:62|Invisible/invisibility:38
What's the most useful kitchen gadget?|Kettle:30|Air fryer:22|Microwave:16|Toaster:12|Tin opener/can opener:6|Blender:4|Slow cooker:4|Knife:2|Bottle opener:2|Garlic press:1|Spiralizer:1
Name a sport you can do on your own.|Running/jogging:34|Swimming:24|Golf:14|Cycling:12|Skiing:4|Surfing:4|Darts:2|Snooker:2|Bowling:2|Yoga:1|Chess:1
Name a famous Jamie.|Jamie Oliver/oliver:62|Jamie Dornan/dornan:12|Jamie Vardy/vardy:10|Jamie Redknapp:6|Jamie Lee Curtis:6|Jamie Foxx:2|Jamie Cullum:1|Jamie Laing:1
Name a word you'd use to describe a baby.|Cute:44|Adorable:14|Small/tiny/little:12|Cuddly:6|Smelly:6|Loud/noisy:6|Chubby:4|Sweet:4|Bald:2|Beautiful:1|Wrinkly:1
What's the best breakfast drink?|Tea:38|Coffee:34|Orange juice/oj:22|Milk:2|Smoothie:2|Water:1|Bucks fizz:1
Name something that's hot.|Sun:44|Fire:20|Oven:8|Chilli:8|Kettle:6|Lava/volcano:6|Tea:3|Summer:2|Desert:1|Me:1|Coffee:1
Name a famous Ben.|Ben Affleck/affleck:28|Ben Stiller/stiller:18|Big Ben:16|Ben Fogle/fogle:12|Ben Shephard:8|Ben & Jerry's/ben and jerry:6|Ben Whishaw:4|Ben Kenobi/obi wan:4|Ben Howard:2|Ben 10:1|Ben Elton:1
Name a type of muscle.|Bicep/biceps:52|Tricep/triceps:10|Abs:10|Heart:8|Calf:6|Quads/quadriceps:4|Glutes:4|Hamstring:3|Pecs:2|Tongue:1
Name a famous chocolate bar.|Mars:22|Dairy Milk/cadbury dairy milk:20|Snickers:14|Kit Kat/kitkat:14|Twix:8|Galaxy:6|Wispa:4|Double Decker:4|Crunchie:3|Twirl:2|Yorkie:1|Boost:1
Name something that's in space.|Stars/star:42|Moon:18|Planets/planet:14|Aliens/alien:8|Sun:6|Astronaut:6|Satellite:3|Black hole:2|Rocket:1
Name a famous Kate or Katie.|Kate Middleton/princess kate/kate:48|Kate Moss/moss:18|Katie Price/jordan:14|Kate Winslet/winslet:10|Katy Perry:6|Kate Bush:2|Katie Holmes:1|Kate Garraway:1
What's the worst thing about Monday?|Work/going to work:52|Waking up/alarm:20|Weekend's over/end of the weekend:14|Traffic:4|Meetings:4|School:4|Bins:1|Everything:1
Name a famous Anne or Ann.|Princess Anne/anne:24|Anne Boleyn/boleyn:22|Anne Hathaway/hathaway:16|Anne Frank/frank:14|Anne Robinson:10|Annie/little orphan annie:6|Anne Hegerty/the governess:4|Anne of Green Gables:2|Ann Widdecombe:1|Annie Lennox:1
Name a type of salad.|Caesar:40|Greek:16|Coleslaw:10|Potato salad:8|Garden/green:8|Pasta salad:6|Waldorf:6|Nicoise:2|Fruit salad:2|Caprese:1|Tuna salad:1
Name a famous Liam.|Liam Gallagher/gallagher:40|Liam Neeson/neeson:28|Liam Payne/payne:22|Liam Hemsworth/hemsworth:8|Liam Fox:1|Liam Brady:1
Name something you do before bed.|Brush teeth/teeth:56|Read:14|Shower/bath:8|Set alarm:6|Scroll phone/phone:6|Pyjamas/get changed:4|Lock the door:2|Pray:2|Cup of tea:1|Wee:1
Name a famous Sam or Samantha.|Sam Smith:28|Samuel L Jackson/samuel l jackson:20|Sam Fender/fender:12|Sam Ryder/ryder:10|Samantha Jones:8|Sam Allardyce/big sam:6|Sam Heughan:6|Samwise Gamgee:4|Sam Warburton:2|Sam Tarly:1|Sammy Davis Jr:1
Name a type of transport.|Car:30|Bus:22|Train:20|Plane:10|Bike/bicycle:8|Boat:4|Taxi:2|Tram:1|Tube:1|Scooter:1|Horse:1
Would you rather be too hot or too cold?|Too cold/cold:56|Too hot/hot:44
Name a famous Charlotte.|Princess Charlotte/charlotte:28|Charlotte Church/church:22|Charlotte Bronte/bronte:16|Charlotte Crosby/crosby:12|Charlotte's Web:8|Charlotte Dujardin:6|Charlotte Hawkins:4|Charlotte Rampling:2|Charlotte Tilbury:1|Charlotte York:1
Name a word that goes before 'ball'.|Foot/football:30|Basket/basketball:16|Snow/snowball:12|Base/baseball:8|Hand/handball:6|Eye/eyeball:6|Meat/meatball:5|Golf/golf ball:5|Disco/disco ball:4|Hair/hairball:2|Moth/mothball:1|Dodge/dodgeball:1
What's the best Quality Street?|The Purple One/purple one:48|Green Triangle/green triangle:16|Strawberry Delight:10|Caramel Swirl:8|Toffee Penny/toffee penny:8|Orange Creme/orange cream:4|Fudge:3|Coconut Eclair:2|Toffee Finger:1
Name a famous Victoria.|Victoria Beckham/beckham/posh:58|Queen Victoria:30|Victoria Wood:8|Victoria Coren Mitchell:2|Victoria Pendleton:1|Victoria Derbyshire:1
Name a famous Dave or David.|David Beckham/beckham:30|David Attenborough/attenborough:24|David Bowie/bowie:18|David Walliams/walliams:12|David Tennant/tennant:6|David Cameron:4|David Jason:3|David Hasselhoff:1|David Dickinson:1|David Blaine:1
Name something you'd find on a desk.|Computer/laptop:30|Pen/pens:20|Paper:10|Lamp:10|Keyboard:6|Mug:6|Stapler:4|Phone:4|Post-it notes:3|Plant:2|Photo frame:2|Rubber duck:1|Crumbs:1
Name a famous bridge.|Golden Gate Bridge/golden gate:44|Tower Bridge:32|London Bridge:10|Brooklyn Bridge:4|Severn Bridge:2|Humber Bridge:2|Forth Bridge:2|Clifton Suspension Bridge:2|Sydney Harbour Bridge:1|Millennium Bridge:1
Name something that's soft.|Pillow:36|Teddy bear/teddy:16|Cotton wool:12|Feather:8|Marshmallow:8|Blanket:6|Baby's skin:4|Cat:4|Toilet paper:3|Butter:2|Kitten:1
Name a way to say goodbye.|Bye:30|See you later/see ya/see you:22|Cheerio:12|Ta-ra/tara:8|Adios:6|Ciao:6|Goodbye:6|Later:4|Toodle-oo/toodles:3|Farewell:2|Peace out:1
What's the best fast food chain?|McDonald's/mcdonalds/maccies:44|KFC:18|Burger King:12|Five Guys:8|Nando's/nandos:8|Greggs:4|Subway:2|Taco Bell:1|Wendy's:1|Wimpy:1|Leon:1
Name a famous Harrison.|Harrison Ford/ford:76|George Harrison:14|Harrison Osterfield:2|Harrison Reed:2|Rex Harrison:2|Harrison Butker:1|Harrison Fraser:1|William Henry Harrison:1
Name a famous Anthony or Ant.|Ant McPartlin/ant:44|Anthony Hopkins/hopkins:22|Anthony Joshua/aj:14|Ant Middleton:8|Anthony Head:4|Tony Blair:4|Antonio Banderas:2|Anthony Ogogo:1|Ant from Ant and Dec:1
Name a reason to go to the pub.|Drinks/a drink/beer:38|Friends/meet friends:20|Football/watch the football:12|Quiz/pub quiz:10|Food/sunday roast:8|Birthday:6|Celebrate:4|Karaoke:1|Escape the kids:1|Darts:1
Name a famous Pete or Peter.|Peter Kay/kay:34|Peter Pan/pan:24|Peter Andre/andre:14|Peter Parker/spider-man:12|Peter Crouch/crouch:8|Pete Doherty:4|Peter Rabbit:2|Peter Jones:1|Peter Capaldi:1
What's the best way to spend a Friday night?|Takeaway/takeaway and a film:30|Pub/drinks:28|Netflix/tv/sofa:18|Party:8|Out with friends:6|Clubbing/club:4|Dinner:3|Bed/sleep:2|Gaming:1
What's the scariest animal?|Shark:28|Spider:22|Snake:20|Crocodile/alligator:10|Lion:6|Bear:4|Wasp:4|Scorpion:2|Hippo:2|Goose:1|Mosquito:1
Name a famous Joe.|Joe Wicks/wicks:30|Joe Biden/biden:22|Joe Sugg/sugg:10|Joey from Friends/joey:8|Joe Lycett/lycett:10|Joe Pasquale:6|Joe Cocker:4|Joe Calzaghe:4|Joe Jonas:2|Joe Exotic:1|Joe Root:1
Name a word to describe the British weather.|Rainy/wet:44|Grey/gloomy:14|Unpredictable:12|Miserable:8|Cold:8|Changeable:4|Drizzly:4|Mild:2|Typical:1|Shocking:1|Sunny:1
Name a famous Freddie or Fred.|Freddie Mercury/mercury:66|Freddie Flintoff/flintoff:16|Fred Astaire/astaire:6|Fred Flintstone/flintstone:6|Fred Weasley:3|Freddie Krueger:2|Fred Dibnah:1|Fred Perry:1
Name a type of biscuit.|Digestive:26|Custard Cream:18|Bourbon:14|Hobnob:10|Rich Tea:10|Jammie Dodger:8|Shortbread:6|Oreo:4|Ginger Nut:2|Party Ring:1|Garibaldi:1
`

export interface Answer {
  /** The answer as shown in results. */
  text: string
  /** Other ways of saying it, already normalised. */
  aliases: string[]
  /** Rough popularity: the AI herd picks answers in proportion to this. */
  weight: number
}

export interface Prompt {
  id: number
  question: string
  answers: Answer[]
}

export const PROMPTS: Prompt[] = RAW.trim()
  .split('\n')
  .map((line, id) => {
    const [question, ...parts] = line.split('|')
    return {
      id,
      question: question!.trim(),
      answers: parts.map((part) => {
        const at = part.lastIndexOf(':')
        const [text, ...aliases] = part.slice(0, at).split('/')
        return { text: text!.trim(), aliases: aliases.map((a) => a.trim()), weight: Number(part.slice(at + 1)) }
      }),
    }
  })

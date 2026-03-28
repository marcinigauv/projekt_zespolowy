from enum import StrEnum


class ProductSortingKey(StrEnum):
    NAME = "name"
    PRICE = "price"
    AMOUNT = "amount"


class ProductSortingDirection(StrEnum):
    ASC = "asc"
    DESC = "desc"


class ProductCategory(StrEnum):
    LEGO = "LEGO"
    TECHNIC = "Technic"
    CITY = "City"
    FRIENDS = "Friends"
    ICONS = "Icons"
    ARCHITECTURE = "Architecture"
    SPEED_CHAMPIONS = "Speed Champions"
    CREATOR = "Creator"
    STAR_WARS = "Star Wars"
    HARRY_POTTER = "Harry Potter"
    MARVEL = "Marvel"
    NINJAGO = "Ninjago"
    DISNEY = "Disney"

    ELECTRONICS = "Elektronika"
    SINGLE_BOARD = "Single board"
    RASPBERRY = "Raspberry Pi"
    ARDUINO = "Arduino"
    IOT = "IoT"
    DRONES = "Drony"
    PHOTOGRAPHY = "Fotografia"
    VIDEO = "Video"
    GIMBAL = "Gimbal"
    ACTION_CAMERA = "Kamera akcji"
    AUDIO = "Audio"
    HEADPHONES = "Słuchawki"
    PORTABLE_SPEAKER = "Głośnik przenośny"
    GAMING = "Gaming"
    GPU = "Karta graficzna"
    PROCESSOR = "Procesor"
    MEMORY = "Pamięć RAM"
    SSD = "Dysk SSD"
    MOUSE = "Mysz komputerowa"
    MONITOR = "Monitor"

    SMART_HOME = "Smart home"
    LIGHTING = "Oświetlenie inteligentne"
    SECURITY_CAMERA = "Kamera monitoringu"
    ROBOT_VACUUM = "Odkurzacz automatyczny"

    ACCESSORIES = "Akcesoria"
    POWERBANK = "Powerbank"
    TRAVEL = "Podróże"
    WORK = "Praca / biuro"
    SPORT = "Sport"
    DECORATION = "Dekoracje"
    COSMOS = "Kosmos"
    FANTASY = "Fantasy"
    SUPERHEROES = "Superbohaterowie"
    GIRLS = "Dla dziewczynek"
    MOTORSPORT = "Motoryzacja / sport motorowy"
    CARS = "Samochody"
    OTHER = "Inne"

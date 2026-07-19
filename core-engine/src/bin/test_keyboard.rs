fn main() {
    let mut enigo = enigo::Enigo::new(&enigo::Settings::default()).unwrap();
    enigo::Keyboard::key(&mut enigo, enigo::Key::Unicode('a'), enigo::Direction::Press).unwrap();
    enigo::Keyboard::key(&mut enigo, enigo::Key::Unicode('a'), enigo::Direction::Release).unwrap();
}

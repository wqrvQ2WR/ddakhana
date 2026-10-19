# 딱 하나 (ddakhana)

유튜브 영상 하나를 다 보면 브라우저 창을 전부 닫아 버리는 확장. 크롬과 사파리에서 같은 코드로 돌아갑니다.

"한 편만 보고 끄자"가 지켜진 적이 없다면, 끄는 쪽을 브라우저한테 맡기는 물건입니다.

## 어떻게 동작하나

1. `youtube.com`에서 영상 재생을 지켜봅니다.
2. 기준(영상 끝 또는 정해진 재생 시간)에 닿으면 재생을 멈추고 전체 화면에 카운트다운을 띄웁니다.
3. 카운트다운이 끝나면 열려 있는 브라우저 창을 전부 닫습니다.

판정 기준은 설정에서 고릅니다.

| 설정 | 기본값 | 설명 |
|------|--------|------|
| 언제 닫을까요 | 영상이 끝나면 | `영상이 끝나면` 또는 `정해진 시간만큼 보면` |
| 재생 시간 기준 | 300초 | 시간 기준일 때만 사용. 실제로 재생된 시간만 쌓이고, 건너뛴 구간은 빼고 셉니다 |
| 카운트다운 | 5초 | 0으로 두면 곧바로 닫습니다 |
| 취소 버튼 보이기 | 켬 | 끄면 카운트다운을 멈출 방법이 없습니다 |

쇼츠처럼 반복 재생되는 영상은 한 바퀴를 다 돌면 한 편 본 것으로 칩니다.

## 설치

### 크롬 (엣지, 웨일 등 크로미움 계열 공통)

1. `chrome://extensions` 로 들어갑니다.
2. 오른쪽 위 **개발자 모드**를 켭니다.
3. **압축해제된 확장 프로그램을 로드합니다**를 누르고 이 저장소의 `extension` 폴더를 고릅니다.
4. 확장 목록에서 **딱 하나 → 세부정보 → 확장 프로그램 옵션**으로 기준을 바꿉니다.

### 사파리 (macOS)

`safari/Ddakhana/Ddakhana.xcodeproj`는 `extension` 폴더를 그대로 참조하는 Xcode 프로젝트입니다. 소스는 한 벌만 관리됩니다.

1. Xcode로 `safari/Ddakhana/Ddakhana.xcodeproj`를 엽니다.
2. 두 타깃(`Ddakhana`, `Ddakhana Extension`)의 **Signing & Capabilities**에서 본인 팀을 고릅니다. 팀이 없으면 자동 서명을 끄고 서명 없이 실행해도 됩니다.
3. 빌드하고 한 번 실행합니다. 빌드만 확인하려면 터미널에서도 됩니다.

   ```bash
   xcodebuild -project "safari/Ddakhana/Ddakhana.xcodeproj" -scheme Ddakhana -configuration Debug -destination 'platform=macOS' CODE_SIGN_IDENTITY="-" CODE_SIGN_STYLE=Manual build
   ```

4. 사파리 → 설정 → 고급에서 **웹 개발자용 기능 보기**를 켜고, 개발자 메뉴에서 **서명되지 않은 확장 프로그램 허용**을 켭니다. (직접 서명한 빌드만 쓸 거라면 건너뛰어도 됩니다.)
5. 사파리 → 설정 → 확장 프로그램에서 **딱 하나**를 켜고, `youtube.com` 접근을 허용합니다.

프로젝트는 `xcrun safari-web-extension-converter extension`으로 만들었고, 앱과 확장의 번들 ID를 `com.hayoonjae.ddakhana` 아래로 맞춰 둔 상태입니다.

## 알아 둘 점

- **macOS 크롬은 창만 닫히고 앱은 독에 남습니다.** 확장 API로는 브라우저를 완전히 종료시킬 수 없어, 창을 전부 닫는 것이 한계입니다. 윈도우와 리눅스에서는 마지막 창이 닫히면서 브라우저도 같이 끝납니다.
- 창을 전부 닫으므로 **다른 탭의 저장 안 한 작업도 같이 날아갑니다.** 취소 버튼을 켜 두는 쪽을 권합니다.
- 권한은 설정 저장용 `storage` 하나만 씁니다. 창을 닫는 `windows` API는 별도 권한이 필요 없습니다.
- 어떤 영상을 봤는지는 기록하지 않고, 아무 데도 보내지 않습니다.

## 구조

```
extension/        크롬과 사파리가 함께 쓰는 확장 소스 (MV3)
  manifest.json
  content.js      재생 감시, 카운트다운 화면
  background.js   창 닫기
  options.html/js 설정 화면
  overlay.css
  icons/
safari/           위 폴더를 참조하는 Xcode 프로젝트
tools/make_icons.py  아이콘 PNG 생성 스크립트
```

아이콘을 다시 만들려면:

```bash
python3 tools/make_icons.py
```

## 라이선스

MIT
